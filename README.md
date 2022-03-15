# Scanpay node.js client

The official Node.js client library for the Scanpay API ([docs](https://docs.scanpay.dk)). You can always e-mail us at [help@scanpay.dk](mailto:help@scanpay.dk), or chat with us on IRC at libera.chat #scanpay

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

#### paymentLink(Object, options) => Promise

Create a link to our hosted payment window ([docs](https://docs.scanpay.dk/payment-link) \| [example](tests/paymentLink.js)).

```js
const order = {
    items: [{ total: '6000 DKK' }]
};
scanpay.paymentLink(order, options)
    .then(url => console.log(url))
    .catch(err => { /* handle errors */ });
```

#### subscriptionLink(Object, options) => Promise

Create a link to our hosted payment window to create a new subscriber ([docs](https://docs.scanpay.dk/subscriptions/create-subscriber) \| [example](tests/subscriptionLink.js)).

```js
const order = {
    subscriber: { ref: '5' }
};
scanpay.subscriptionLink(order, options)
    .then(url => console.log(url))
    .catch(err => { /* handle errors */ });
```

#### seq(Integer, options) => Object

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

#### charge(Integer, Object, Object) => String

Charge an amount from an existing subscriber ([docs](https://docs.scanpay.dk/subscriptions/charge-subscriber) \| [example](tests/charge.js)):

```js
const subscriberID = 5;
const order = {
    items: [{ total: '6000 DKK' }]
};
scanpay.charge(subscriberID, order, options)
    .then(res => console.log(res))
    .catch(err => { /* handle errors */ });
```

#### renew(Integer, Object, Object) => String

Renew the payment method for an existing subscriber ([docs](https://docs.scanpay.dk/subscriptions/renew-subscriber) \| [example](tests/renew.js)):

```js
const subscriberID = 5;
scanpay.renew(subscriberID, order, options)
    .then(url => console.log(url))
    .catch(err => { /* handle errors */ });
```

## Options

All methods, except `handlePing`, accept an optional per-request `options` object. You can use it to:

* Change the hostname to use our test environment `api.test.scanpay.dk` ([example](tests/options.js#L12))
* Set the API key for this request ([example](tests/options.js#L15))
* Set HTTP headers, e.g. the highly recommended `X-Cardholder-IP` ([example](tests/options.js#L18-L20))
* Set `debug` flag ([example](tests/options.js#L23))


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
