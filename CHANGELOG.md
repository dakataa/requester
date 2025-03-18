# 2.0.0
## Breaking Changes
### Core
- Method `Requester.post` now accept only one argument of type `PostRequestConfig` which contains all needed arguments.
- Method `Requester.get` now accept only one argument of type `GetRequestConfig` which contains all needed arguments.
- Added new *static* method `Requester.instance` for easy instance initialization.
- Added new *static* method `Requester.post`.
- Added new type `PostRequestConfig`, used for POST request configuration.
- Added new type `GetRequestConfig`, used for GET request configuration.
