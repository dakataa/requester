const {test} = require('node:test');
const assert = require('node:assert/strict');
const {Requester, BearerToken, BasicAuth, APIKey, recordRequests} = require('./helpers.cjs');

// AppendParameterTo is not exported by the package; these mirror its numeric values.
const HEADER = 0;
const QUERY = 1;

test('BearerToken sends an Authorization header', async () => {
    const [call] = await recordRequests(() =>
        new Requester({authorization: new BearerToken('abc')}).get({url: 'https://example.test/me'}));

    assert.equal(call.headers.get('authorization'), 'Bearer abc');
});

test('BasicAuth sends base64 encoded credentials with the Basic scheme', async () => {
    const [call] = await recordRequests(() =>
        new Requester({authorization: new BasicAuth('user', 'pass')}).get({url: 'https://example.test/me'}));

    assert.equal(call.headers.get('authorization'), 'Basic ' + Buffer.from('user:pass').toString('base64'));
});

test('BasicAuth encodes non-Latin-1 credentials as UTF-8', () => {
    const header = new BasicAuth('потребител', 'парола€').getHeaders().Authorization;

    assert.equal(header, 'Basic ' + Buffer.from('потребител:парола€', 'utf8').toString('base64'));
});

test('APIKey can be sent as a header', async () => {
    const [call] = await recordRequests(() =>
        new Requester({authorization: new APIKey('X-Api-Key', 'secret', HEADER)}).get({url: 'https://example.test/q?a=1'}));

    assert.equal(call.headers.get('x-api-key'), 'secret');
    assert.equal(new URL(call.url).search, '?a=1');
});

test('APIKey can be sent as a query parameter', async () => {
    const [call] = await recordRequests(() =>
        new Requester({authorization: new APIKey('key', 'secret', QUERY)}).get({url: 'https://example.test/q?a=1'}));

    assert.equal(call.headers.has('key'), false);
    assert.deepEqual([...new URL(call.url).searchParams], [['a', '1'], ['key', 'secret']]);
});

test('request auth overrides configured auth; null falls back to it', async () => {
    const requester = new Requester({authorization: new BearerToken('configured')});
    const calls = await recordRequests(async () => {
        await requester.fetch({url: 'https://example.test/a', auth: new BearerToken('request')});
        await requester.fetch({url: 'https://example.test/b', auth: null});
    });

    assert.equal(calls[0].headers.get('authorization'), 'Bearer request');
    assert.equal(calls[1].headers.get('authorization'), 'Bearer configured');
});

test('authorization headers override caller and configured headers', async () => {
    const requester = new Requester({
        authorization: new BearerToken('token'),
        headers: {Authorization: 'configured'}
    });
    const [call] = await recordRequests(() =>
        requester.fetch({url: 'https://example.test/a', headers: {authorization: 'caller'}}));

    assert.equal(call.headers.get('authorization'), 'Bearer token');
});
