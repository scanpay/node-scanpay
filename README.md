# Scanpay node.js client

Node.js client library for the Scanpay API. You can always e-mail us at [help@scanpay.dk](mailto:help@scanpay.dk) or chat with us on `irc.scanpay.dk:6697` or `#scanpay` at Freenode ([webchat](https://webchat.freenode.net?randomnick=1&channels=scanpay&prompt=1))

## Installation

This package works with Node.js >= 6.6. You can install the package with [npm](https://www.npmjs.com/package/scanpay):

```bash
npm install scanpay --save
```
You can then include it in your project with:

```js
const scanpay = require('scanpay')('API key');
```

### Manual installation

If you do not wish to use npm, you can download the [latest release](https://github.com/scanpaydk/node-scanpay/releases) and include in into your project:

```js
const scanpay = require('lib/scanpay.js')('API key');
```

## Usage

The API documentation is available [here](https://docs.scanpay.dk/). All methods, except `handlePing`, will return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Most methods accept an optional per-request object with [options](#options), here referred to as `options`.

#### newURL(Object, options) => String

Create a link to our hosted payment window ([docs](https://docs.scanpay.dk/payment-link) \| [example](tests/newURL.js)).

```js
const order = {
    items: [{ total: '6000 DKK' }]
};
scanpay.newURL(order, options)
    .then(url => console.log(url))
    .catch(err => { /* handle errors */ });
```

#### seq(Int, options) => Object

Make a sequence request to pull changes from the server ([docs](https://docs.scanpay.dk/synchronization#sequence-request) \| [example](tests/seq.js)).

```js
const localSeq = 921;
scanpay.seq(localSeq, options)
    .then(obj => console.log(obj.changes))
    .catch(err => { /* handle errors */ });
```

#### handlePing(String, String)

Handle and validate synchronization pings.
The method accepts two arguments, the body of the received ping and the `X-Signature` HTTP header. The method returns an object ([docs](https://docs.scanpay.dk/synchronization#ping-service) \| [example](tests/handlePing.js)).

```js
try {
    const json = scanpay.handlePing(body, req.headers['x-signature']);
} catch (e) { /* handle errors */ }
```

## Options

All methods, except `handlePing`, accept an optional per-request `options` object. You can use it to:

* Set the API key for this request ([example](tests/newURL.js#L8))
* Set HTTP headers, e.g. the highly recommended `X-Cardholder-IP` ([example](tests/newURL.js#L11))
* Change the hostname to use our test environment `api.test.scanpay.dk` ([example](tests/newURL.js#L9))

## Compatibility table

Nodejs compatibility table for this library.

| Feature                           | Version |
| :-------------------------------- | :-----: |
| crypto.timingSafeEqual            | 6.6     |
| Arrow functions                   | 6.0     |
| Default function parameters       | 6.0     |
| Array.isArray                     | 6.0     |
| Buffer.from                       | 5.10    |


## License

Everything in this repository is licensed under the [MIT license](LICENSE).
