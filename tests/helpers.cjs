const library = require('../dist/index.js');

async function withFetch(replacement, action) {
    const original = globalThis.fetch;
    globalThis.fetch = replacement;
    try {
        return await action();
    } finally {
        globalThis.fetch = original;
    }
}

// Runs the action against a fetch stub that records every call and answers with `respond`.
async function recordRequests(action, respond = () => new Response('ok')) {
    const calls = [];
    await withFetch(async (url, options) => {
        calls.push({url: String(url), options, headers: new Headers(options.headers)});
        return respond(url, options);
    }, action);
    return calls;
}

module.exports = {...library, Requester: library.default, withFetch, recordRequests};
