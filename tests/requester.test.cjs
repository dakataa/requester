const assert = require('node:assert/strict');
const {test, afterEach} = require('node:test');
const {default: Requester, Response: RequesterResponse, Method, RequestBodyType, InterceptEvent} = require('../dist/index.js');

const nativeFetch = globalThis.fetch;
const interceptorIds = [];
afterEach(() => {
    globalThis.fetch = nativeFetch;
    interceptorIds.splice(0).forEach(id => Requester.off(id));
});

const instance = (config = {}) => new Requester({baseURL: 'https://example.test', ...config});
const jsonResponse = () => new Response('{}', {headers: {'content-type': 'application/json'}});

test('serializes JSON bodies for POST, PUT, PATCH and DELETE', async () => {
    const calls = [];
    globalThis.fetch = async (url, options) => {
        calls.push(new Request(url, options));
        return jsonResponse();
    };
    for (const method of [Method.POST, Method.PUT, Method.PATCH, Method.DELETE]) {
        await instance({headers: {'content-type': 'text/plain', 'x-config': 'kept'}}).fetch({
            url: '/items/1', method, body: {title: 'Редакция'}, bodyType: RequestBodyType.JSON
        });
        const request = calls.pop();
        assert.equal(request.method, method);
        assert.equal(request.headers.get('content-type'), 'application/json');
        assert.equal(request.headers.get('x-config'), 'kept');
        assert.deepEqual(await request.json(), {title: 'Редакция'});
    }
});

test('preserves multipart files and repeated fields without a configured JSON header', async () => {
    const form = new FormData();
    form.append('tags[]', 'one');
    form.append('tags[]', 'two');
    form.append('file', new File(['contents'], 'example.txt'));
    globalThis.fetch = async (url, options) => {
        assert.equal(options.body, form);
        assert.equal(new Headers(options.headers).has('content-type'), false);
        const sent = await new Request(url, options).formData();
        assert.deepEqual(sent.getAll('tags[]'), ['one', 'two']);
        assert.equal(await sent.get('file').text(), 'contents');
        return jsonResponse();
    };
    await instance({headers: {'Content-Type': 'application/json'}}).fetch({url: '/items', method: Method.POST, body: form});
});

test('encodes URL-encoded objects and keeps repeated FormData values', async () => {
    const bodies = [];
    globalThis.fetch = async (url, options) => {
        const request = new Request(url, options);
        assert.equal(request.headers.get('content-type'), 'application/x-www-form-urlencoded');
        bodies.push(new URLSearchParams(await request.text()));
        return jsonResponse();
    };
    await instance().post({url: '/items', body: '{"name":"A B"}', bodyType: RequestBodyType.Urlencoded});
    const form = new FormData();
    form.append('tag', 'one');
    form.append('tag', 'two');
    await instance().fetch({url: '/items', method: Method.PUT, body: form, bodyType: RequestBodyType.Urlencoded});
    assert.equal(bodies[0].get('name'), 'A B');
    assert.deepEqual(bodies[1].getAll('tag'), ['one', 'two']);
});

test('preserves raw text and binary bodies', async () => {
    const bodies = [];
    globalThis.fetch = async (url, options) => {
        bodies.push(await new Request(url, options).text());
        return jsonResponse();
    };
    await instance().fetch({url: '/items', method: Method.POST, body: 'hello', bodyType: RequestBodyType.Text});
    await instance().fetch({url: '/items', method: Method.PUT, body: new Uint8Array([65, 66])});
    assert.deepEqual(bodies, ['hello', 'AB']);
});

test('propagates invalid JSON to the caller and ERROR interceptor', async () => {
    const errors = [];
    interceptorIds.push(Requester.on(InterceptEvent.ERROR, (_id, error) => errors.push(error)));
    for (const body of ['', '   ', '{broken']) {
        errors.length = 0;
        globalThis.fetch = async () => new Response(body, {headers: {'content-type': 'application/json'}});
        await assert.rejects(instance().fetch({url: '/items'}), SyntaxError);
        assert.equal(errors.length, 1);
        assert.ok(errors[0] instanceof SyntaxError);
    }
});

test('propagates abort while reading a response body', async () => {
    const controller = new AbortController();
    let reading;
    const started = new Promise(resolve => {reading = resolve;});
    globalThis.fetch = async (_url, options) => new Response(new ReadableStream({
        start(stream) {
            options.signal.addEventListener('abort', () => stream.error(options.signal.reason), {once: true});
            reading();
        }
    }), {headers: {'content-type': 'application/json'}});
    const request = instance().fetch({url: '/items', signal: controller.signal});
    const rejected = assert.rejects(request, error => error === 'canceled');
    await started;
    controller.abort('canceled');
    await rejected;
});

test('external signal bypasses timeout while reading a delayed body', {timeout: 1000}, async () => {
    const external = new AbortController();
    globalThis.fetch = async (_url, options) => {
        assert.equal(options.signal, external.signal);
        return new Response(new ReadableStream({
            async start(stream) {
                await new Promise(resolve => setTimeout(resolve, 30));
                stream.enqueue(new TextEncoder().encode('done'));
                stream.close();
            }
        }));
    };
    const result = await instance({timeout: 1000}).fetch({url: '/items', signal: external.signal, timeout: 10});
    assert.equal(result.data, 'done');
    assert.equal(external.signal.aborted, false);
});

test('passes an already aborted signal to fetch and notifies ERROR once', async () => {
    const controller = new AbortController();
    controller.abort('canceled');
    const errors = [];
    interceptorIds.push(Requester.on(InterceptEvent.ERROR, (_id, error) => errors.push(error)));
    globalThis.fetch = async (_url, options) => {
        assert.equal(options.signal.aborted, true);
        throw options.signal.reason;
    };
    await assert.rejects(instance().fetch({url: '/items', signal: controller.signal}), error => error === 'canceled');
    assert.deepEqual(errors, ['canceled']);
});

test('response data is cached for false, null, zero, empty text and concurrent readers', async () => {
    for (const value of [false, null, 0]) {
        const response = new RequesterResponse(new Response(JSON.stringify(value), {headers: {'content-type': 'application/json'}}));
        assert.deepEqual(await Promise.all([response.getResponseData(), response.getResponseData()]), [value, value]);
        assert.equal(await response.getResponseData(), value);
    }
    const empty = new RequesterResponse(new Response(''));
    assert.equal(await empty.getResponseData(), '');
    assert.equal(await empty.getResponseData(), '');
});

test('handles 204 JSON responses and preserves the interceptor lifecycle', async () => {
    const events = [];
    for (const event of [InterceptEvent.PRE_REQUEST, InterceptEvent.PRE_RESPONSE, InterceptEvent.POST_RESPONSE, InterceptEvent.ERROR]) {
        interceptorIds.push(Requester.on(event, () => events.push(event)));
    }
    globalThis.fetch = async () => new Response(null, {status: 204, headers: {'content-type': 'application/json'}});
    const result = await instance().fetch({url: '/items/1', method: Method.DELETE});
    assert.equal(result.status, 204);
    assert.equal(result.data, '');
    assert.deepEqual(events, [InterceptEvent.PRE_REQUEST, InterceptEvent.PRE_RESPONSE, InterceptEvent.POST_RESPONSE]);
});
