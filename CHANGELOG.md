# 3.0.0
## Changes
- Added per-request `timeout` support to `fetch()`, `get()`, and `post()`, including their static helpers.
- Added `bodyType` support to `fetch()` and body serialization for JSON, FormData, and URL-encoded requests.
- `fetch()` can send a body with any method other than GET.
- Response data is read once and cached for subsequent access.
- Request headers now take precedence over configured headers; authorization headers take precedence over both.
- Added automated tests for configuration, authorization, request bodies, interceptors, responses, and data helpers.

## Fixes
- Query parameters replace matching values in the URL; authorization query parameters take precedence over caller values. Repeated values supplied in `URLSearchParams` are preserved.
- A timeout applies only until response headers arrive and is skipped when the caller supplies an `AbortSignal`. Timeout aborts use a `TimeoutError` reason; `timeout: 0` falls back to 30 seconds, `Infinity` disables the timeout, and larger finite values are capped at the maximum supported timer delay.
- Header names are merged without regard to case, and an explicit `Content-Type` is preserved.
- Native `Blob`, `URLSearchParams`, `ArrayBuffer`, typed array, and `ReadableStream` bodies are sent without JSON conversion. Configured `Content-Type` is removed when fetch can infer a better type; request and authorization headers still take precedence.
- `post()` converts supported text-only `FormData` to JSON by default and preserves repeated fields as arrays. FormData containing files, field names that JSON conversion would change, or conflicting field paths (such as `user` and `user[name]`) is sent as multipart, and a `null` body is sent empty.
- Non-plain query values, such as `Date`, are included in the URL.
- Exceptions from `POST_RESPONSE` observers are logged without rejecting successful requests or triggering `ERROR` observers.
- Empty responses expose an empty string as `data`.
- `BasicAuth` sends a valid `Basic` header: credentials are base64 encoded (previously decoded with `atob`, which could throw) and non-Latin-1 characters are encoded as UTF-8.
- `convertURLSearchParamsToObject` keeps every value of a repeated `key[]` parameter instead of only the last one, including when object and array bracket keys are mixed.

# 2.0.3
## Changes
- Fix response to handle blobs

# 2.0.2
## Changes
- Fix FormData key parsing to support hyphenated keys in `DataHelper.convertFormDataToObject`


# 2.0.1
## Changes
- Add new Intercept Event `Error` triggered on canceling request or exception.
- Add new types for Intercept Event Callbacks `PostResponseCallback`, `PreRequestCallback`, `PreResponseCallback`, `ErrorCallback`
- Separate Intercept Events by namespaces. Now you can handle specific event for a namespace. 
```typescript
Requester.on(InterceptEvent.PRE_REQUEST, (requestId, url) => { }, 'namespace')
```

# 2.0.0
## Breaking Changes
### Core
- The `Requester.post` method now accepts only one argument of type `PostRequestConfig`, which contains all the necessary parameters.
- The `Requester.get` method now accepts only one argument of type `GetRequestConfig`, which contains all the necessary parameters.
- Added a new static method `Requester.instance` for easier instance initialization.
- Added a new static method `Requester.post`.
- Added a new type `PostRequestConfig` for configuring POST requests.
- Added a new type `GetRequestConfig` for configuring GET requests.
