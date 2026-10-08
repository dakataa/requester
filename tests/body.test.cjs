const {test} = require('node:test');
const assert = require('node:assert/strict');
const {Requester, APIKey, Method, RequestBodyType, recordRequests} = require('./helpers.cjs');

const url = 'https://example.test/submit';
const send = (body, bodyType, method = Method.POST) =>
    recordRequests(() => new Requester().fetch({url, method, body, bodyType})).then(([call]) => call);

test('Urlencoded encodes objects, including nested values', async () => {
    const call = await send({a: 1, b: {c: 'x y'}, list: [1, 2]}, RequestBodyType.Urlencoded);

    assert.equal(call.options.body, 'a=1&b%5Bc%5D=x+y&list%5B0%5D=1&list%5B1%5D=2');
    assert.equal(call.headers.get('content-type'), 'application/x-www-form-urlencoded');
});

test('Urlencoded accepts FormData, URLSearchParams and JSON strings', async () => {
    const form = new FormData();
    form.append('a', '1');
    form.append('a', '2');

    assert.equal((await send(form, RequestBodyType.Urlencoded)).options.body, 'a=1&a=2');
    assert.equal((await send(new URLSearchParams({x: '1'}), RequestBodyType.Urlencoded)).options.body, 'x=1');
    assert.equal((await send('{"j":"v"}', RequestBodyType.Urlencoded)).options.body, 'j=v');
});

test('Urlencoded sends an already encoded string as-is', async () => {
    assert.equal((await send('a=1&b=2', RequestBodyType.Urlencoded)).options.body, 'a=1&b=2');
});

test('FormData bodyType converts objects and JSON strings to multipart FormData', async () => {
    const fromObject = await send({name: 'x', nested: {key: 'v'}}, RequestBodyType.FormData);
    const fromString = await send('{"name":"y"}', RequestBodyType.FormData);

    assert.ok(fromObject.options.body instanceof FormData);
    assert.deepEqual([...fromObject.options.body], [['name', 'x'], ['nested[key]', 'v']]);
    assert.deepEqual([...fromString.options.body], [['name', 'y']]);
    assert.equal(fromObject.headers.has('content-type'), false);
});

test('FormData bodyType rejects strings that are not JSON and non-object values', async () => {
    await assert.rejects(send('not json', RequestBodyType.FormData), TypeError);
    await assert.rejects(send(42, RequestBodyType.FormData), TypeError);
});

test('JSON bodyType sends strings unchanged and serializes objects', async () => {
    const fromString = await send('{"raw":true}', RequestBodyType.JSON);
    const fromObject = await send({a: [1, {b: null}]}, RequestBodyType.JSON);

    assert.equal(fromString.options.body, '{"raw":true}');
    assert.equal(fromObject.options.body, '{"a":[1,{"b":null}]}');
    assert.equal(fromObject.headers.get('content-type'), 'application/json');
});

test('POST converts repeated text FormData fields without losing values', async () => {
    const form = new FormData();
    form.append('tag', 'a');
    form.append('tag', 'b');
    const [call] = await recordRequests(() => new Requester().post({url, body: form}));

    assert.equal(call.options.body, '{"tag":["a","b"]}');
    assert.equal(call.headers.get('content-type'), 'application/json');
});

test('native POST bodies use their own content type unless the caller sets one', async () => {
    const requester = new Requester({headers: {'Content-Type': 'application/json'}});
    const params = new URLSearchParams('a=1');
    const blob = new Blob(['content'], {type: 'text/plain'});
    const bytes = new Uint8Array([1, 2]);
    const calls = await recordRequests(async () => {
        await requester.post({url, body: params});
        await requester.post({url, body: blob});
        await requester.post({url, body: bytes});
        await requester.fetch({url, method: Method.POST, body: params, headers: {'content-type': 'application/custom'}});
    });

    assert.equal(calls[0].headers.has('content-type'), false);
    assert.equal(calls[1].headers.has('content-type'), false);
    assert.equal(calls[2].headers.get('content-type'), 'application/json');
    assert.match(new Request(url, {method: 'POST', body: calls[0].options.body, headers: calls[0].options.headers})
        .headers.get('content-type'), /^application\/x-www-form-urlencoded/);
    assert.equal(new Request(url, {method: 'POST', body: calls[1].options.body, headers: calls[1].options.headers})
        .headers.get('content-type'), 'text/plain');
    assert.equal(calls[3].headers.get('content-type'), 'application/custom');
});

test('authorization Content-Type remains authoritative for native bodies', async () => {
    const requester = new Requester({
        headers: {'Content-Type': 'application/json'},
        authorization: new APIKey('Content-Type', 'application/vnd.auth', 0)
    });
    const calls = await recordRequests(async () => {
        await requester.post({url, body: new Uint8Array([1, 2])});
        await requester.post({url, body: new URLSearchParams('a=1')});
    });

    assert.deepEqual(calls.map(call => call.headers.get('content-type')),
        ['application/vnd.auth', 'application/vnd.auth']);
});

test('configured Content-Type remains for native bodies without an inferred type', async () => {
    const requester = new Requester({headers: {'Content-Type': 'application/json'}});
    const calls = await recordRequests(async () => {
        await requester.post({url, body: new ArrayBuffer(2)});
        await requester.post({url, body: new Uint8Array([1, 2])});
        await requester.post({url, body: new Blob(['x'])});
    });

    assert.deepEqual(calls.map(call => call.headers.get('content-type')),
        ['application/json', 'application/json', 'application/json']);
});

test('POST keeps unsupported FormData field names unchanged as multipart', async () => {
    const form = new FormData();
    form.append('first name', 'Ada');
    form.append('foo.bar', 'value');
    form.append('', 'empty');
    const requester = new Requester({headers: {'Content-Type': 'application/json'}});
    const [call] = await recordRequests(() => requester.post({url, body: form}));

    assert.equal(call.options.body, form);
    assert.equal(call.headers.has('content-type'), false);
    const encoded = await new Request(url, {method: 'POST', body: call.options.body, headers: call.options.headers}).text();
    assert.match(encoded, /name="first name"/);
    assert.match(encoded, /name="foo.bar"/);
    assert.match(encoded, /name=""/);
    await assert.rejects(requester.post({url, body: form, bodyType: RequestBodyType.JSON}),
        /FormData field names require FormData bodyType/);
});

test('POST keeps FormData with conflicting field paths unchanged as multipart', async () => {
    const conflicts = [
        [['user', 'alice'], ['user[name]', 'Bob']],
        [['user[name]', 'Bob'], ['user', 'alice']],
        [['a[]', '1'], ['a[b]', '2']],
        [['a[b]', '1'], ['a[b][c]', '2']]
    ];

    for (const fields of conflicts) {
        const form = new FormData();
        fields.forEach(([name, value]) => form.append(name, value));
        const [call] = await recordRequests(() => new Requester().post({url, body: form}));

        assert.equal(call.options.body, form, fields.map(([name]) => name).join(' + '));
        await assert.rejects(new Requester().post({url, body: form, bodyType: RequestBodyType.JSON}),
            /FormData field names require FormData bodyType/);
    }
});

test('POST still converts compatible FormData field paths to JSON', async () => {
    const form = new FormData();
    form.append('user[name]', 'Bob');
    form.append('user[email]', 'bob@example.test');
    form.append('tags[]', 'a');
    form.append('tags[]', 'b');
    form.append('tag', 'x');
    form.append('tag', 'y');
    const [call] = await recordRequests(() => new Requester().post({url, body: form}));

    assert.deepEqual(JSON.parse(call.options.body), {
        user: {name: 'Bob', email: 'bob@example.test'},
        tags: ['a', 'b'],
        tag: ['x', 'y']
    });
});

test('fetch infers JSON for plain objects and leaves strings untyped', async () => {
    const object = await send({a: 1});
    const string = await send('plain text');

    assert.equal(object.options.body, '{"a":1}');
    assert.equal(object.headers.get('content-type'), 'application/json');
    assert.equal(string.options.body, 'plain text');
    assert.equal(string.headers.has('content-type'), false);
});

test('Text and Binary body types set their Content-Type', async () => {
    assert.equal((await send('hello', RequestBodyType.Text)).headers.get('content-type'), 'text/plain');
    assert.equal((await send(new Uint8Array([1]), RequestBodyType.Binary)).headers.get('content-type'), 'application/octet-stream');
});

test('PUT, PATCH and DELETE send a body; GET does not', async () => {
    for (const method of [Method.PUT, Method.PATCH, Method.DELETE]) {
        assert.equal((await send({m: method}, undefined, method)).options.body, JSON.stringify({m: method}));
    }

    const get = await send({ignored: true}, undefined, Method.GET);
    assert.equal('body' in get.options, false);
    assert.equal(get.headers.has('content-type'), false);
});
