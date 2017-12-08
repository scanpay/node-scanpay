# Scanpay node.js client

Node.js client library for the Scanpay API. You can always e-mail us at [help@scanpay.dk](mailto:help@scanpay.dk) or chat with us on `irc.scanpay.dk:6697` or `#scanpay` at Freenode ([webchat](https://webchat.freenode.net?randomnick=1&channels=scanpay&prompt=1))

## Installation

This package works with Node.js >= 6.6. Install the package with [npm](https://www.npmjs.com/package/scanpay):

```bash
npm install scanpay --save
```
and include it in your project.

```js
const scanpay = require('scanpay')('API key');
```

### Manual installation

Download the [latest release](releases) and include in into your project:

```js
const scanpay = require('lib/scanpay.js')('API key');
```

## Methods

All methods, except `handlePing`, will return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Note that some methods accept an optional per-request [`options`](#options) object.

### newURL(Object, options) => String

Create a [payment link](https://docs.scanpay.dk/payment-link#request-fields) by passing the order details through `newURL`. Strictly speaking, only the following data is required, but we strongly encourage you to use the entire spec ([example](tests/newURL.js)).

```js
const order = {
    items: [{ total: '6000 DKK' }]
};
scanpay.newURL(order, options)
    .then(url => console.log(url))
    .catch(err => { /* handle errors */ });
```

### handlePing(String, String)

Securely and efficiently validate [pings](https://docs.scanpay.dk/synchronization). This method accepts two arguments from the received ping request, the HTTP message body and the `X-Signature` HTTP header. The return value is a JSON object ([example](tests/handlePing.js)).

```js
try {
    const json = scanpay.handlePing(body, req.headers['x-signature']);
} catch (e) { /* handle errors */ }
```

### seq(Int, options) => Object

Make a [sequence request](https://docs.scanpay.dk/synchronization#seq-request) to get an object with a number of changes since the supplied sequence number ([example](tests/seq.js)).

```js
const localSeq = 921;
scanpay.seq(localSeq, options)
    .then(obj => console.log(obj.changes))
    .catch(err => { /* handle errors */ });
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
