# Requester
This library is created to help using [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

## Installing

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
This configuration is applied to all instances.

```typescript
Requester.defaults = {
    baseURL: 'https://example-api.com',
    headers: {
        Accept: 'application/json'
    }
};
```

#### Multi-space Configuration

Setup:
```php
Requester.namespace["secure_area"] = {
    authorization: new BearerToken('Token')
};
```

How to use it: 
```typescript
(new Requester({}, 'secure_area')).post({
    url: '',
    body: {
        key: 'value'
    }
}).then(({status, data}) => {
    console.log(data)
});
```

or with  static method **instance()**

```typescript
Requester.instance('secure_area').post({
    url: '/path/to/endpoint',
    body: {
        key: 'value'
    }
}).then((data: Response) => {

});
```

with aliased request method

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

### Methods

- post([PostRequestConfig](#PostRequestConfig))
- get([GetRequestConfig](#GetRequestConfig))
- fetch([Request](#Request))


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
| FormData   | form-data             | Full URL or Pathname  |
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

### POST Request

```typescript
Requester.instance().post({
    url: '/post/endpoint-path', 
	body: {
        form: {
            key1: 'value',
            key2: {name: 'Yordan'},
            key3: ['example', 'array']
        }
    }
}).then((response) => {
    const status = response.status;

    console.log('data', response.data);
}).catch((e) => {
    console.log('error', e);
});
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
