# 2.0.3
## Changes


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
