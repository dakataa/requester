# Requester
Requester is created to help using Fetch API.

### Installing

#### Using npm:
npm install @dakataa/requester

#### Using yarn:
yarn add @dakataa/requester

#### Configuration


Default Global ([Config](#config))
```typescript
import Requester from 'requester';

Requester.defaults = {
    baseURL: 'https://example-api.com',
    headers: {
        Accept: 'application/json'
    }
};
```

Multi Namespace Global Configuration combination with default global

```typescript
import Requester, {BearerToken, PostRequestConfig, Response} from "@dakataa/requester";
import Config from "./Config";

Requester.defaults = {
    baseURL: 'https://example-api.com',
};

Requester.namespace["secure_area"] = {
    authorization: new BearerToken('Token')
};

(new Requester({}, 'secure_area')).post({
    url: '',
    body: {
        key: 'value'
    }
}).then(({status, data}) => {
    console.log(data)
});

// with instance static method

Requester.instance('secure_area').post({
    url: '/path/to/endpoint',
    body: {
        key: 'value'
    }
}).then((data: Response) => {

});

// with method shortcut

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

### Request method aliases
For convenience, aliases have been provided for all common request methods.

- Requester.post([PostRequestConfig](#PostRequestConfig) & [InstanceConfig](#InstanceConfig)
- Requester.get([GetRequestConfig](#GetRequestConfig) & [InstanceConfig](#InstanceConfig))

## Types

### Config

| Key           | Type                    | Default | Required | Description                 |
|---------------|-------------------------|---------|----------|-----------------------------|
| baseURL       | string                  |         | No       | Base URL to create Endpoint |
| authorization | AuthorizationInterface  |         | No       | Authorization Object.       |
| headers       | array                   |         | No       | List of HTTP Headers.       |

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
