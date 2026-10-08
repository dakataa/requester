const {test, afterEach} = require('node:test');
const assert = require('node:assert/strict');
const {Requester, BearerToken, Method, recordRequests} = require('./helpers.cjs');

afterEach(() => {
    delete Requester.namespace.secure;
});

test('relative URLs resolve against baseURL; absolute URLs ignore it', async () => {
    const requester = new Requester({baseURL: 'https://api.test/v1/'});
    const calls = await recordRequests(async () => {
        await requester.get({url: 'users'});
        await requester.get({url: '/root'});
        await requester.get({url: 'https://other.test/x'});
    });

    assert.deepEqual(calls.map(call => call.url), [
        'https://api.test/v1/users',
        'https://api.test/root',
        'https://other.test/x'
    ]);
});

test('relative URLs without baseURL are rejected', async () => {
    await assert.rejects(new Requester().get({url: '/users'}), TypeError);
});

test('configured headers are sent with every request', async () => {
    const requester = new Requester({headers: {'X-Client': 'web'}});
    const calls = await recordRequests(async () => {
        await requester.get({url: 'https://example.test/a'});
        await requester.post({url: 'https://example.test/b', body: {a: 1}});
    });

    assert.deepEqual(calls.map(call => call.headers.get('x-client')), ['web', 'web']);
});

test('namespace configuration supplies authorization and baseURL', async () => {
    Requester.namespace.secure = {
        baseURL: 'https://secure.test/',
        authorization: new BearerToken('ns-token')
    };

    const calls = await recordRequests(async () => {
        await new Requester({}, 'secure').get({url: 'a'});
        await Requester.post({url: 'b', body: {}, namespace: 'secure'});
        await Requester.instance({namespace: 'secure'}).get({url: 'c'});
    });

    assert.deepEqual(calls.map(call => call.url), ['https://secure.test/a', 'https://secure.test/b', 'https://secure.test/c']);
    assert.deepEqual(calls.map(call => call.headers.get('authorization')), Array(3).fill('Bearer ns-token'));
});

test('instance config and namespace config are merged', async () => {
    Requester.namespace.secure = {authorization: new BearerToken('ns-token')};

    const [call] = await recordRequests(() =>
        Requester.get({url: 'a', namespace: 'secure', config: {baseURL: 'https://config.test/'}}));

    assert.equal(call.url, 'https://config.test/a');
    assert.equal(call.headers.get('authorization'), 'Bearer ns-token');
});

test('an unknown namespace falls back to the given config', async () => {
    const [call] = await recordRequests(() =>
        Requester.get({url: 'a', namespace: 'missing', config: {baseURL: 'https://config.test/'}}));

    assert.equal(call.url, 'https://config.test/a');
});

test('static helpers pass query, body and method through', async () => {
    const calls = await recordRequests(async () => {
        await Requester.get({url: 'https://example.test/a', query: {page: 2}});
        await Requester.post({url: 'https://example.test/b', body: {name: 'x'}});
    });

    assert.equal(calls[0].url, 'https://example.test/a?page=2');
    assert.equal(calls[0].options.method, Method.GET);
    assert.equal(calls[1].options.method, Method.POST);
    assert.equal(calls[1].options.body, '{"name":"x"}');
});
