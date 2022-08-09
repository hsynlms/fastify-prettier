# fastify-prettier
> A simple and lightweight beautifier plugin for [Fastify](https://github.com/fastify/fastify).

[![Downloads](https://img.shields.io/npm/dm/fastify-prettier.svg)](https://npmjs.com/fastify-prettier)
[![install size](https://packagephobia.com/badge?p=fastify-prettier)](https://packagephobia.com/result?p=fastify-prettier)

`fastify-prettier` has support of beautifying payloads via query parameter to make responses more readable for developers/humans. Decorator`prettier` can also be used anywhere in the fastify server as the content beautifier. The plugin itself uses [prettier](https://github.com/prettier/prettier) under the hood and is capable of parsing/formatting anything that prettier can.

`fastify-prettier` uses `onSend` fastify hook to beautify the response payload before it gets sent.

**Note:** `streams` and `buffers` are excluded in beautification process.
**Note:** Fastify v4 support is shipped with v2.0.0.

## Installation
```
$ npm install fastify-prettier
```

## Usage

```js
const fastify = require('fastify')()
const fastifyPrettier = require('fastify-prettier')

fastify.register(
  fastifyPrettier,
  {
    fallbackOnError: false
  }
)

fastify.get('/', (req, reply) => {
  const obj = {
    blackLivesMatter: true,
    favSinger: 'Ahmet Kaya'
  }

  reply
    .type('application/json')
    .send(obj)
})

fastify.listen(3000, () => {
  console.log('Fastify server is running on port: 3000')
})

// -------------------------------

// http://localhost:3000 -> will print out below result
/*
{"blackLivesMatter":true,"favSinger":"Ahmet Kaya"}
*/

// http://localhost:3000?pretty=true -> will print out below result
/*
{
  "blackLivesMatter": true,
  "favSinger": "Ahmet Kaya"
}
*/
```

You are allowed to change the query parameter option.

```js
fastify.register(
  fastifyPrettier,
  {
    query: {
      name: 'beautify',
      value: 'yes'
    }
  }
)

// -------------------------------

// http://localhost:3000 -> will print out below result
/*
{"blackLivesMatter":true,"favSinger":"Ahmet Kaya"}
*/

// http://localhost:3000?beautify=yes -> will print out below result
/*
{
  "blackLivesMatter": true,
  "favSinger": "Ahmet Kaya"
}
*/
```

You can enable beautification for all outgoing payloads regardless the query parameter.

```js
fastify.register(
  fastifyPrettier,
  {
    alwaysOn: true
  }
)

// -------------------------------

// http://localhost:3000 -> will print out below result
/*
{
  "blackLivesMatter": true,
  "favSinger": "Ahmet Kaya"
}
*/
```

### Usage of Decorator

Feel free to use `prettier` decorator which beautifies the given content through the provided options whenever you need.

```js
const response = fastify.prettier(
  // content type can be: boolean, number, object, array, string
  content,
  // prettier options (please see: prettierOpts)
  { parser: 'html', htmlWhitespaceSensitivity: 'ignore' }
)
```

## Options

| Name                   | Type               | Default                                     | Description                                                          |
| ---                    | ---                | ---                                         | ---                                                                  |
| alwaysOn               | boolean            | false                                       | To make all the payloads beautified in anyway   |
| fallbackOnError        | boolean            | true                                        | If something bad happens, send the original payload. If its `false`, an error will be thrown |
| overrideContentLength  | boolean            | true                                        | Re-calculate `content-length` header for the beautified response                         |
| query                  | object             | `{ name: 'pretty', value: 'true' }`         | The query parameter that triggers the plugin to beautify the outgoing payload |
| enableOnSendHook       | boolean            | true                                        | Allow the plugin to get injected into fastify `onSend` hook to beautify outgoing responses. The prettier decorator can still be used even if that option is disabled |
| prettierOpts           | object             | `{ tabWidth: 2, parser: 'json-stringify' }` | Please take a look prettier [official documentation](https://prettier.io/docs/en/options.html) for more information |
