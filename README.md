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

| Key       | Default | Required | Description                    |
|-----------|---------|----------|--------------------------------|
| appliedTo |         | Yes      |  Enum:  |


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


### Examples

### POST Request

```typescript
import response from "./Response";

(new Requester()).post('/post/endpoint-path', {
    form: {
        key1: 'value',
        key2: {name: 'Yordan'},
        key3: ['example', 'array']
    }
}).then((response) => {
    const status = response.status;

    response.getData().then(v => setData(v));
}).catch((e) => {
    console.log('error', e);
});
```
