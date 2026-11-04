const {test, afterEach} = require('node:test');
const assert = require('node:assert/strict');
const {Requester, InterceptEvent, recordRequests, withFetch} = require('./helpers.cjs');

let registered = [];
const on = (...args) => {
    const id = Requester.on(...args);
    registered.push(id);
    return id;
};

afterEach(() => {
    registered.forEach(id => Requester.off(id));
    registered = [];
});

test('successful requests run PRE_REQUEST, PRE_RESPONSE and POST_RESPONSE in order', async () => {
    const events = [];
    on(InterceptEvent.PRE_REQUEST, (id, url, options) => events.push(['PRE_REQUEST', id, String(url), options.method]));
    on(InterceptEvent.PRE_RESPONSE, (id, response) => events.push(['PRE_RESPONSE', id, response.status]));
    on(InterceptEvent.POST_RESPONSE, (id, response) => events.push(['POST_RESPONSE', id, response.data]));
    on(InterceptEvent.ERROR, () => events.push(['ERROR']));

    await recordRequests(() => Requester.get({url: 'https://example.test/a'}), () => new Response('done', {status: 201}));

    const id = events[0][1];
    assert.equal(typeof id, 'number');
    assert.deepEqual(events, [
        ['PRE_REQUEST', id, 'https://example.test/a', 'GET'],
        ['PRE_RESPONSE', id, 201],
        ['POST_RESPONSE', id, 'done']
    ]);
});

test('failed requests run PRE_REQUEST and ERROR with the rejection reason', async () => {
    const events = [];
    const failure = new TypeError('network down');
    on(InterceptEvent.PRE_REQUEST, () => events.push('PRE_REQUEST'));
    on(InterceptEvent.PRE_RESPONSE, () => events.push('PRE_RESPONSE'));
    on(InterceptEvent.POST_RESPONSE, () => events.push('POST_RESPONSE'));
    on(InterceptEvent.ERROR, (id, reason) => events.push(reason));

    await withFetch(async () => {
        throw failure;
    }, () => assert.rejects(Requester.get({url: 'https://example.test/a'}), failure));

    assert.deepEqual(events, ['PRE_REQUEST', failure]);
});

test('each request gets a new id', async () => {
    const ids = [];
    on(InterceptEvent.PRE_REQUEST, (id) => ids.push(id));

    await recordRequests(async () => {
        await Requester.get({url: 'https://example.test/a'});
        await Requester.get({url: 'https://example.test/b'});
    });

    assert.equal(ids.length, 2);
    assert.notEqual(ids[0], ids[1]);
});

test('PRE_REQUEST can change the outgoing request options', async () => {
    on(InterceptEvent.PRE_REQUEST, (id, url, options) => {
        options.headers['X-Trace'] = 'trace-1';
    });

    const [call] = await recordRequests(() => Requester.get({url: 'https://example.test/a'}));

    assert.equal(call.headers.get('x-trace'), 'trace-1');
});

test('namespaced interceptors run only for that namespace; global ones run for all', async () => {
    const seen = [];
    on(InterceptEvent.PRE_REQUEST, (id, url) => seen.push(['global', new URL(url).pathname]));
    on(InterceptEvent.PRE_REQUEST, (id, url) => seen.push(['admin', new URL(url).pathname]), 'admin');

    await recordRequests(async () => {
        await Requester.get({url: 'https://example.test/plain'});
        await Requester.get({url: 'https://example.test/other', namespace: 'other'});
        await Requester.get({url: 'https://example.test/admin', namespace: 'admin'});
    });

    assert.deepEqual(seen, [
        ['global', '/plain'],
        ['global', '/other'],
        ['global', '/admin'],
        ['admin', '/admin']
    ]);
});

test('off() removes an interceptor and ignores unknown ids', async () => {
    let calls = 0;
    const id = on(InterceptEvent.PRE_REQUEST, () => calls++);

    assert.equal(Requester.off(id), Requester);
    assert.equal(Requester.off(999999), Requester);
    await recordRequests(() => Requester.get({url: 'https://example.test/a'}));

    assert.equal(calls, 0);
});

test('a throwing PRE_REQUEST interceptor rejects the request without calling fetch', async () => {
    const failure = new Error('blocked');
    const errors = [];
    on(InterceptEvent.PRE_REQUEST, () => {
        throw failure;
    });
    on(InterceptEvent.ERROR, (id, reason) => errors.push(reason));

    const calls = await recordRequests(() =>
        assert.rejects(Requester.get({url: 'https://example.test/a'}), failure));

    assert.equal(calls.length, 0);
    assert.deepEqual(errors, [failure]);
});
