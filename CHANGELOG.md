# 2.0.0
## Breaking Changes
### Core
- The `Requester.post` method now accepts only one argument of type `PostRequestConfig`, which contains all the necessary parameters.
- The `Requester.get` method now accepts only one argument of type `GetRequestConfig`, which contains all the necessary parameters.
- Added a new static method `Requester.instance` for easier instance initialization.
- Added a new static method `Requester.post`.
- Added a new type `PostRequestConfig` for configuring POST requests.
- Added a new type `GetRequestConfig` for configuring GET requests.
