# Requester
Requester is created to help using Fetch API.

### Installing

#### Using npm:
npm install @dakataa/requester

#### Using yarn:
yarn add @dakataa/requester


### Config

Config Object keys.

| Key           | Default | Required | Description                 |
|---------------|---------|----------|-----------------------------|
| baseURL       |         | No       | Base URL to create Endpoint |
| authorization |         | No       | Authorization Object.       |
| headers       |         | No       | List of HTTP Headers.       |

Authorization Object

| Key       | Default | Required | Description |
|-----------|---------|----------|-------------|
| appliedTo |         | Yes      | Enum:       |


#### Configuration

Default Global
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
import Requester, {BearerToken, PostRequestConfig} from "@dakataa/requester";

Requester.defaults = {
    baseURL: 'https://example-api.com',
};

Requester.namespace["secure_area"] = {
    authorization: new BearerToken('Token')
};

(new Requester({}, 'secure_area')).post({
    url: '',
    body: {}, // json, binary, xml, ,
    bodyType: '' // Request Body Type - FormData, JSON, Binary etc..
}).then();

// or 

Requester.instance('secure_area').post(PostRequestConfig).then();

// or just

Requester.post({url: 'https://', ...}).then()
```

### Examples

### POST Request

```typescript
import response from "./Response";

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
