const {test} = require('node:test');
const assert = require('node:assert/strict');
const {Requester, Response: RequesterResponse, withFetch} = require('./helpers.cjs');

const respondWith = (response) => withFetch(async () => response, () => Requester.get({url: 'https://example.test/a'}));

test('JSON responses are parsed', async () => {
    const response = await respondWith(Response.json({ok: true}, {status: 202}));

    assert.equal(response.status, 202);
    assert.deepEqual(response.getData(), {ok: true});
    assert.deepEqual(response.data, {ok: true});
});

test('JSON content types with parameters are parsed', async () => {
    const response = await respondWith(new Response('{"a":1}', {headers: {'Content-Type': 'application/json; charset=utf-8'}}));

    assert.deepEqual(response.data, {a: 1});
});

test('responses with Content-Disposition are read as a Blob', async () => {
    const response = await respondWith(new Response('file body', {
        headers: {'Content-Disposition': 'attachment; filename="a.txt"', 'Content-Type': 'text/plain'}
    }));

    assert.ok(response.data instanceof Blob);
    assert.equal(await response.data.text(), 'file body');
});

test('other responses are read as text', async () => {
    const response = await respondWith(new Response('<p>hi</p>', {headers: {'Content-Type': 'text/html'}}));

    assert.equal(response.data, '<p>hi</p>');
});

test('error statuses resolve with their data', async () => {
    const response = await respondWith(Response.json({error: 'missing'}, {status: 404}));

    assert.equal(response.status, 404);
    assert.deepEqual(response.data, {error: 'missing'});
});

test('response data is read once and cached', async () => {
    let reads = 0;
    const native = new Response('{"a":1}', {headers: {'Content-Type': 'application/json'}});
    const json = native.json.bind(native);
    native.json = () => {
        reads++;
        return json();
    };
    const response = new RequesterResponse(native);

    const [first, second] = await Promise.all([response.getResponseData(), response.getResponseData()]);
    const third = await response.getResponseData();

    assert.equal(reads, 1);
    assert.equal(first, second);
    assert.equal(first, third);
});

test('setData replaces the cached data', async () => {
    const response = new RequesterResponse(new Response('text'));
    await response.getResponseData();
    response.setData({replaced: true});

    assert.deepEqual(await response.getResponseData(), {replaced: true});
});

test('getHeaders exposes the native response headers', async () => {
    const response = await respondWith(new Response('', {headers: {'X-Request-Id': 'r-1'}}));

    assert.equal(response.getHeaders().get('x-request-id'), 'r-1');
});

test('a caller abort rejects with the caller reason, not a timeout', async () => {
    const controller = new AbortController();
    const reason = new Error('user cancelled');
    const request = withFetch((url, options) => new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(options.signal.reason), {once: true});
    }), () => {
        const pending = Requester.get({url: 'https://example.test/slow', signal: controller.signal});
        controller.abort(reason);
        return pending;
    });

    await assert.rejects(request, error => error === reason && error.name !== 'TimeoutError');
});
