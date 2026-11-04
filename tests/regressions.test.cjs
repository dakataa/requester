const {test} = require('node:test');
const assert = require('node:assert/strict');
const {
    default: Requester, APIKey, InterceptEvent, Method, RequestBodyType, Response: RequesterResponse
} = require('../dist/index.js');

async function withFetch(replacement, action) {
    const original = globalThis.fetch;
    globalThis.fetch = replacement;
    try {
        return await action();
    } finally {
        globalThis.fetch = original;
    }
}

test('query replaces URL values, and configured API key replaces caller values', async () => {
    const requester = new Requester({authorization: new APIKey('key', 'secret', 1)});
    let requestedURL;
    await withFetch(async (url) => {
        requestedURL = url;
        return new Response('ok');
    }, () => requester.get({url: 'https://example.test/q?page=1&key=old', query: {page: 2, key: 'user'}}));
    assert.equal(requestedURL.searchParams.toString(), 'page=2&key=secret');

    await withFetch(async (url) => {
        requestedURL = url;
        return new Response('ok');
    }, () => requester.get({url: 'https://example.test/q?page=1', query: new URLSearchParams('page=2&page=3')}));
    assert.deepEqual(requestedURL.searchParams.getAll('page'), ['2', '3']);
});

test('Date and other non-plain query values remain in the URL', async () => {
    const when = new Date('2025-01-02T03:04:05.000Z');
    let requestedURL;
    await withFetch(async (url) => {
        requestedURL = url;
        return new Response('ok');
    }, () => Requester.get({url: 'https://example.test/q', query: {when, nested: {page: 2}}}));
    assert.equal(requestedURL.searchParams.get('when'), String(when));
    assert.equal(requestedURL.searchParams.get('nested[page]'), '2');
});

test('headers merge without duplicate casing and explicit Content-Type wins', async () => {
    let options;
    await withFetch(async (_url, requestOptions) => {
        options = requestOptions;
        return new Response('ok');
    }, () => Requester.instance({config: {headers: {'Content-Type': 'application/json'}}}).fetch({
        url: 'https://example.test/q', method: Method.POST, body: {a: 1},
        headers: {'content-type': 'application/merge-patch+json'}
    }));
    assert.equal(new Headers(options.headers).get('Content-Type'), 'application/merge-patch+json');
    assert.equal(Object.keys(options.headers).filter(key => key.toLowerCase() === 'content-type').length, 1);
    assert.equal(options.body, '{"a":1}');
});

test('bodyType Content-Type wins over config defaults', async () => {
    let options;
    await withFetch(async (_url, requestOptions) => {
        options = requestOptions;
        return new Response('ok');
    }, () => Requester.instance({config: {headers: {'content-type': 'application/json'}}}).fetch({
        url: 'https://example.test/q', method: Method.POST, body: {a: 1}, bodyType: RequestBodyType.Urlencoded
    }));
    assert.equal(options.body, 'a=1');
    assert.equal(new Headers(options.headers).get('content-type'), 'application/x-www-form-urlencoded');
});

test('POST keeps native bodies, converts text-only FormData to JSON, and leaves null empty', async () => {
    const observed = [];
    const requester = Requester.instance();
    const blob = new Blob(['blob']);
    const parameters = new URLSearchParams('a=1');
    const buffer = new Uint8Array([1, 2]).buffer;
    const form = new FormData();
    form.set('field', 'value');
    await withFetch(async (_url, options) => {
        observed.push(options);
        return new Response('ok');
    }, async () => {
        for (const body of [blob, parameters, buffer]) {
            await requester.post({url: 'https://example.test/q', body});
        }
        await requester.post({url: 'https://example.test/q', body: form});
        await requester.post({url: 'https://example.test/q', body: form, bodyType: RequestBodyType.FormData});
        await requester.post({url: 'https://example.test/q', body: null});
    });
    assert.equal(observed[0].body, blob);
    assert.equal(observed[1].body, parameters);
    assert.equal(observed[2].body, buffer);
    assert.equal(observed[3].body, '{"field":"value"}');
    assert.equal(new Headers(observed[3].headers).get('content-type'), 'application/json');
    assert.equal(observed[4].body, form);
    assert.equal(new Headers(observed[4].headers).has('content-type'), false);
    assert.equal(observed[5].body, undefined);
});

test('POST preserves files in FormData and rejects incompatible body types', async () => {
    const form = new FormData();
    form.set('title', 'report');
    form.set('upload', new Blob(['file contents'], {type: 'text/plain'}), 'report.txt');
    const requester = Requester.instance({config: {headers: {'Content-Type': 'application/json'}}});
    let options;
    await withFetch(async (_url, requestOptions) => {
        options = requestOptions;
        return new Response('ok');
    }, () => requester.post({url: 'https://example.test/upload', body: form}));

    assert.equal(options.body, form);
    assert.equal(new Headers(options.headers).has('content-type'), false);
    const nativeRequest = new Request('https://example.test/upload', {
        method: 'POST', body: options.body, headers: options.headers
    });
    assert.match(nativeRequest.headers.get('content-type'), /^multipart\/form-data; boundary=/);
    const encoded = await nativeRequest.text();
    assert.match(encoded, /filename="report.txt"/);
    assert.match(encoded, /file contents/);

    await assert.rejects(requester.post({url: 'https://example.test/upload', body: form, bodyType: RequestBodyType.JSON}),
        /FormData containing files requires FormData bodyType/);
    await assert.rejects(requester.post({url: 'https://example.test/upload', body: form, bodyType: RequestBodyType.Urlencoded}),
        /FormData containing files requires FormData bodyType/);
});

test('fetch keeps a ReadableStream body', async () => {
    const stream = new ReadableStream({start(controller) { controller.close(); }});
    let options;
    await withFetch(async (_url, requestOptions) => {
        options = requestOptions;
        return new Response('ok');
    }, () => Requester.instance().fetch({url: 'https://example.test/q', method: Method.POST, body: stream}));
    assert.equal(options.body, stream);
    assert.equal(options.duplex, 'half');
});

test('ordinary requests work without optional body globals', async () => {
    const original = {
        ReadableStream: globalThis.ReadableStream,
        Blob: globalThis.Blob,
        FormData: globalThis.FormData
    };
    const bodies = [];
    const responses = [new Response('ok'), new Response('ok')];
    try {
        globalThis.ReadableStream = undefined;
        globalThis.Blob = undefined;
        globalThis.FormData = undefined;
        await withFetch(async (_url, options) => {
            bodies.push(options.body);
            return responses.shift();
        }, async () => {
            await Requester.post({url: 'https://example.test/q', body: {a: 1}});
            await Requester.instance().fetch({url: 'https://example.test/q', method: Method.POST, body: {b: 2}});
        });
    } finally {
        globalThis.ReadableStream = original.ReadableStream;
        globalThis.Blob = original.Blob;
        globalThis.FormData = original.FormData;
    }
    assert.deepEqual(bodies, ['{"a":1}', '{"b":2}']);
});

test('timeout ends at response headers and has a distinct reason', async () => {
    let signal;
    await withFetch(async (_url, options) => {
        signal = options.signal;
        const body = new ReadableStream({
            start(controller) {
                setTimeout(() => { controller.enqueue(new TextEncoder().encode('slow')); controller.close(); }, 35);
            }
        });
        return new Response(body);
    }, async () => {
        const result = await Requester.get({url: 'https://example.test/q', timeout: 10});
        assert.equal(result.data, 'slow');
    });
    assert.equal(signal.aborted, false);

    await withFetch((_url, options) => new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(options.signal.reason), {once: true});
    }), async () => {
        await assert.rejects(Requester.get({url: 'https://example.test/q', timeout: 10}),
            error => error instanceof DOMException && error.name === 'TimeoutError');
    });
});

test('timeout still aborts when DOMException is unavailable', async () => {
    const original = globalThis.DOMException;
    try {
        globalThis.DOMException = undefined;
        await withFetch((_url, options) => new Promise((resolve, reject) => {
            options.signal.addEventListener('abort', () => reject(options.signal.reason), {once: true});
        }), async () => {
            await assert.rejects(Requester.get({url: 'https://example.test/q', timeout: 10}),
                error => error instanceof Error && error.name === 'TimeoutError');
        });
    } finally {
        globalThis.DOMException = original;
    }
});

test('caller signal bypasses timeout; zero falls back and large values do not fire immediately', async () => {
    const caller = new AbortController();
    const signals = [];
    await withFetch(async (_url, options) => {
        signals.push(options.signal);
        await new Promise(resolve => setTimeout(resolve, 30));
        return new Response('ok');
    }, async () => {
        await Requester.get({url: 'https://example.test/q', signal: caller.signal, timeout: 5});
        await Requester.get({url: 'https://example.test/q', timeout: 0});
        await Requester.get({url: 'https://example.test/q', timeout: Infinity});
        await Requester.get({url: 'https://example.test/q', timeout: 2 ** 31});
    });
    assert.equal(signals[0], caller.signal);
    assert.equal(signals[1].aborted, false);
    assert.equal(signals[2].aborted, false);
    assert.equal(signals[3].aborted, false);
});

test('a throwing POST_RESPONSE observer does not reject or run ERROR observers', async () => {
    let errors = 0;
    const logged = [];
    const originalConsoleError = console.error;
    console.error = (...args) => logged.push(args);
    const postId = Requester.on(InterceptEvent.POST_RESPONSE, () => { throw new Error('observer failed'); });
    const errorId = Requester.on(InterceptEvent.ERROR, () => { errors++; });
    try {
        await withFetch(async () => new Response('ok'), async () => {
            const result = await Requester.get({url: 'https://example.test/q'});
            assert.equal(result.data, 'ok');
        });
        assert.equal(errors, 0);
        assert.equal(logged.length, 1);
        assert.equal(logged[0][0], 'POST_RESPONSE interceptor failed');
    } finally {
        console.error = originalConsoleError;
        Requester.off(postId);
        Requester.off(errorId);
    }
});

test('empty responses expose empty text', async () => {
    for (const status of [204, 205, 304]) {
        const response = new RequesterResponse(new Response(null, {status}));
        assert.equal(await response.getResponseData(), '');
        assert.equal(response.data, '');
    }
});
