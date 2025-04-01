# Requester
The library is a utility designed to simplify HTTP requests using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).
It provides a clean and flexible interface for making `GET`, `POST`, and other HTTP requests, with support for various request body types, authorization mechanisms, and interceptors.

### Table of Contents
1. [Installation](#installation)
2. [Configuration](#config)
   - [Default](#default-configuration-config)
   - [Namespace](#namespace-configuration)
3. [API Reference](#api-reference)
   - [Requester](#requester-class)
     - [Method](#methods)
     - [Static Methods](#request-method-aliases)
   - [Types](#types) 
   - [Enums](#enums)
   - [Classes](#class)
     - [BearerToken](#bearertoken)
     - [BasicAuth](#basicauth)
     - [ApiKey](#apikey)
4. [Examples](#examples)
   - [POST Request](#making-a-post-request)
   - [GET Request](#making-a-get-request)
   - [Authorization Example](#using-authorization)
5. [Changelog](#changelog)
6. [FAQ](#faq)

## Installation
Install the library via your preferred package manager:

#### Using npm:
```shell
npm install @dakataa/requester
```

#### Using yarn:
```shell
yarn add @dakataa/requester
```

### Configuration

#### Default Configuration ([Config](#config))
You can set default configuration values that apply to all instances.
For example: 
```typescript
Requester.defaults = {
    baseURL: 'https://example-api.com',
    headers: {
        Accept: 'application/json'
    }
};
```

#### Namespace Configuration
The `namespace` feature allows for custom configurations for different use cases or contexts. 
Each namespace can have its own settings, such as authorization.

#### Example: Setting up a Namespace
```php
Requester.namespace["secure_area"] = {
    authorization: new BearerToken('Token')
};
```

#### Example: Setting up a Namespace
```typescript
(new Requester({}, 'secure_area')).post({
    url: '/secure-endpoint',
    body: {
        key: 'value'
    }
}).then(({status, data}) => {
    console.log(data)
});

// or

// Using the `instance` static method
Requester.instance('secure_area').post({
    url: '/path/to/endpoint',
    body: {
        key: 'value'
    }
}).then((data: Response) => {

});
```

#### Using Aliased Methods
The following saves on boilerplate with a single line:
```typescript
Requester.post({
    url: '/path/to/endpoint',
    body: {
        key: 'value'
    },
    bodyType: RequestBodyType.JSON,
    namespace: 'secure_area'
}).then(({status, data}) => {
    console.log(data)
});
```

## API Reference

### Requester Class

#### Methods

- **`fetch(config: Request): Promise<Response>`**  
  Makes an HTTP request based on the provided configuration.

- **`post(config: PostRequestConfig): Promise<Response>`**  
  Makes a `POST` request.

- **`get(config: GetRequestConfig): Promise<Response>`**  
  Makes a `GET` request.

- **`static instance(config?: InstanceConfig): Requester`**  
  Creates a new `Requester` instance with the provided configuration.

- **`static on(event: InterceptEvent, callback: Function): number`**  
  Adds an interceptor for the specified event.

- **`static off(interceptorId: number): void`**  
  Removes an interceptor by its ID.


### Request method aliases
For convenience, aliases have been provided for all common request methods.

- Requester.instance([InstanceConfig](#InstanceConfig))
- Requester.post([PostRequestConfig](#PostRequestConfig) & [InstanceConfig](#InstanceConfig)
- Requester.get([GetRequestConfig](#GetRequestConfig) & [InstanceConfig](#InstanceConfig))

## Types

### Config

| Key           | Type                                                                                           | Default | Required | Description                 |
|---------------|------------------------------------------------------------------------------------------------|---------|----------|-----------------------------|
| baseURL       | string                                                                                         |         | No       | Base URL to create Endpoint |
| authorization | Authorization Object ([BearerToken](#BearerToken), [BasicAuth](#BasicAuth), [APIKey](#APIKey)) |         | No       | Authorization Object.       |
| headers       | array                                                                                          |         | No       | List of HTTP Headers.       |

### InstanceConfig

| Key       | Type    | Default | Required | Description                                      |
|-----------|---------|---------|----------|--------------------------------------------------|
| config    | Config  |         | No       | Configuration                                    |
| namespace | string  |         | No       | Which namespace to use for default configuration |


### PostRequestConfig

| Key        | Type                                                                                                 | Required | Description          |
|------------|------------------------------------------------------------------------------------------------------|----------|----------------------|
| url        | string                                                                                               | Yes      | Full URL or Pathname |
| body       | [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData), string, Object ([key: value]) | No       | Request Body         |
| bodyType   | [RequestBodyType](#RequestBodyType)                                                                  | No (Default: RequestBodyType.JSON)      | Type of Request Body |

### GetRequestConfig

| Key      | Type                                                                                                       | Required | Description          |
|----------|------------------------------------------------------------------------------------------------------------|----------|----------------------|
| url      | string                                                                                                     | Yes      | Full URL or Pathname |
| query    | [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams), Object ([key: value]) | No       | URL Query Parameters |

### Request

| Key      | Type                                | Description                |
|----------|-------------------------------------|----------------------------|
| url      | number, URL                         |                            |
| method   | Method                              | Request METHOD             |
| body     | Any                                 | Request BODY               |
| query    | Object, URLSearchParams, FormData   | URL Query Parameters       |
| signal   | AbortSignal                         | Fetch Request Abort Signal |
| headers  | Object                              | Request Headers            |
| timeout  | number                              | Request Timeout            |


### Response

| Key    | Type   | Description                                            |
|--------|--------|--------------------------------------------------------|
| status | number | Response Status Code (200, 400, etc...)                |
| data   | any    | Response Data (JSON, Text) depends on response headers |


## Enums

### RequestBodyType
Every RequestBodyType send the body with corresponding request headers.

| Case       | Type                  | Description           |
|------------|-----------------------|-----------------------|
| FormData   | form-data             | FormData              |
| Urlencoded | x-www-form-urlencoded | Request Body          |
| JSON       | raw (JSON)            | Send Body as raw JSON |
| Text       | raw (Text)            | Send Body as raw Text |
| Xml        | raw (XML)             | Send Body             |
| Html       | raw (Html)            | Request Body          |
| Javascript | raw (Javascript)      | Request Body          |
| Binary     | raw (binary)          | Request Body          |


## Authorization
This classes helps you to authorize.
We have some basic implementation. You can implement yours.

### BearerToken
This class apply Bearer token to headers in your request.

| Argument | Type   | Description  |
|----------|--------|--------------|
| token    | string | Access Token |

### BasicAuth
This class apply basic Authorization header with base64 encoded combination of username and password.

| Argument | Type   | Description |
|----------|--------|-------------|
| username | string |             |
| password | string |             |

### APIKey
This class apply custom Header with *key* and *value* you have set.

| Argument | Type   | Description |
|----------|--------|-------------|
| key      | string | X-API-Key   |
| value    | string | Token       |


Example: 
```typescript
new BearerToken('token')
```

### Examples

### Making a GET Request

```typescript
Requester.get({
    url: '/search?id=2',
	query: { 
        search: 'term'
    }
}).then(({data, status}) => {
    console.log(status, data);
})
```

### Making a POST Request

```typescript
Requester.post({
    url: '/post/endpoint-path', 
	body: {
        form: {
            key1: 'value',
            key2: {name: 'Yordan'},
            key3: ['example', 'array']
        }
    },
}).then(({data, status}) => {
    console.log(status, data);
});
```

### Using Authorization

```typescript
import BearerToken from "./BearerToken";

Requester.get({
    url: '/profile/me',
    config: {
        authorization: new BearerToken('token')
    }
}).then(({data, status}) => {
    console.log(status, data);
})
```

## Changelog

For a detailed list of changes, see the [CHANGELOG](CHANGELOG.md) file.


## FAQ

### How do I set a custom base URL?
You can set a custom base URL using the `defaults` configuration:

```typescript
Requester.defaults = {
    baseURL: 'https://my-custom-api.com'
};
```

### Can I use this library in Node.js?
This library is designed for use in browser environments. 
For Node.js, consider using libraries like axios or node-fetch.
