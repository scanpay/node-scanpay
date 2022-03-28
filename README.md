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
The API documentation is available [here](https://docs.scanpay.dk/). All methods, except `handlePing`, will return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). All methods accept an optional [options](#options) object, herein referred to as `options`.


#### paylink.create(object, options)
Create a link to our hosted payment window, where the customer can enter their payment details, e.g. cardnumber. ([docs](https://docs.scanpay.dk/payment-link) \| [example](tests/paymentLink.js)).

```js
scanpay.paylink.create({
        orderid: 'inv--001',
        items: [{
            name: 'iPhone',
            total: '6995.95 DKK'
        }]
    })
    .then(res => console.log(res.url))
    .catch(err => console.error(err));
```

#### paylink.delete(string, options)
Delete a payment link. **Not implemented yet; ETA: 2022-07**

```js
scanpay.paylink.delete('https://betal.scanpay.dk/ax18s0')
    .then(res => console.log(res.url))
    .catch(err => console.error(err));
```

### Transactions

#### transaction.capture(integer, object, options)
Fully or partially capture an authorized transaction.

```js
scanpay.transaction.capture(1337, {
        amount: '6995.95 DKK',
        index: 0
    })
    .then(res => console.log(res))
    .catch(err => console.error(err));
```

#### transaction.refund(integer, object, options)
Refund a captured amount from a transaction. **Not implemented yet; ETA: 2022-07**

```js
scanpay.transaction.refund(1337, {
        amount: '6995.95 DKK',
        index: 1
    })
    .then(res => console.log(res))
    .catch(err => console.error(err));
```

#### transaction.void(integer, object, options)
Void a transaction, i.e. release the authorization and cancel the transaction. **Not implemented yet; ETA: 2022-07**

```js
scanpay.transaction.void(1338)
    .then(res => console.log(res))
    .catch(err => console.error(err));
```

### Subscriptions

#### subscriber.create(object, options)
Create a link to our hosted payment window to create a new subscriber ([docs](https://docs.scanpay.dk/subscriptions/create-subscriber) \| [example](tests/subscriptionLink.js)).

```js
scanpay.subscriber.create({
        subscriber: { ref: 'customer8' }, // Your own reference
        successurl: 'http://blixen.dk/success',
        billing: { /* ... */}
    })
    .then(url => console.log(url))
    .catch(err => console.error(err));
```

#### subscriber.charge(integer, object, options)
Charge an amount from an existing subscriber ([docs](https://docs.scanpay.dk/subscriptions/charge-subscriber) \| [example](tests/charge.js)):

```js
scanpay.subscriber.charge(5, {
        orderid: "inv-2102",
        items: [{
            name: "flixNet subscription",
            total: '299.95 DKK'
        }]
    })
    .then(res => console.log(res))
    .catch(err => console.error(err));
```

#### subscriber.renew(integer, object, options)
Renew the payment method for an existing subscriber ([docs](https://docs.scanpay.dk/subscriptions/renew-subscriber) \| [example](tests/renew.js)):

```js
scanpay.subscriber.renew(5, {
        successurl: 'http://blixen.dk/success'
    })
    .then(url => console.log(url))
    .catch(err => console.error(err));
```


#### subscriber.delete(integer, options)
Delete a subscriber. **Not implemented yet; ETA: 2022-07**

```js
scanpay.subscriber.delete(5)
    .then(url => console.log(url))
    .catch(err => console.error(err));
```

#### seq(integer, options)

Make a sequence request to pull changes from the server ([docs](https://docs.scanpay.dk/synchronization#sequence-request) \| [example](tests/seq.js)).

```js
const localSeq = 921;
scanpay.seq(localSeq, options)
    .then(obj => console.log(obj.changes))
    .catch(err => console.error(err));
```

#### handlePing(string, string)

Handle and validate synchronization pings.
The method accepts two arguments, the body of the received ping and the `X-Signature` HTTP header. The method returns an object ([docs](https://docs.scanpay.dk/synchronization#ping-service) \| [example](tests/handlePing.js)).

```js
try {
    const json = scanpay.handlePing(body, req.headers['x-signature']);
} catch (e) { /* handle errors */ }
```




### Options

All methods, except `handlePing`, accept an optional per-request `options` object. You can use it to:

* Change the hostname to use our test environment `api.test.scanpay.dk` ([example](tests/options.js#L12))
* Set the API key for this request ([example](tests/options.js#L15))
* Set HTTP headers, e.g. the highly recommended `X-Cardholder-IP` ([example](tests/options.js#L18-L20))
* Set `debug` flag ([example](tests/options.js#L23))


## Idempotency
TODO... describe in detail.


## Error handling

Our API is forgiving, and so is this client library. We will only throw if you do not comply with the types described in this document. Otherwise, errors will be rejected in the returned promise. The error object you receive will have one of the following types:

```js
switch (err.type) {
  case 'ScanpayInvalidRequestError':
    // Invalid parameters were supplied to Scanpay's API
    break;
  case 'ScanpayAPIError':
    // An error occurred internally with Scanpay's API
    break;
  case 'ScanpayConnectionError':
    // Some kind of error occurred during the HTTPS communication
    break;
  case 'ScanpayAuthenticationError':
    // You probably used an incorrect API key
    break;
  case 'ScanpayRateLimitError':
    // Too many requests hit the API too quickly
    break;
}
```

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
