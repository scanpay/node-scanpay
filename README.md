# Scanpay Node.js library

The Scanpay Node.js library provides convenient and simplified access to the Scanpay API from applications written in server-side JavaScript (Node.js). The library is developed and maintained by Scanpay ApS in Denmark. You can always e-mail us at [help@scanpay.dk](mailto:help@scanpay.dk), or chat with us on IRC at libera.chat #scanpay ([webchat](https://web.libera.chat/#scanpay)).

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

If you do not wish to use npm, you can download the [latest release](https://github.com/scanpaydk/node-scanpay/releases) and include it into your project:

```js
const scanpay = require('lib/scanpay.js')('API key');
```

## Usage
The API documentation is available at [docs.scanpay.dk](https://docs.scanpay.dk/). All methods return a chainable [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Programmer errors, e.g. [`TypeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError), will throw an exception, but all other errors are catchable with `Promise.catch()`. All methods accept an optional object called [`options`](#options).

#### paymentLink.create(object, options)
Create a link to our hosted payment window, where the customer can enter their payment details, e.g. card number, to make a regular one-time purchase ([docs](https://docs.scanpay.dk/payment-link) \| [example](tests/paymentLink.js)). For subscriptions, or save-card functionality, use [`subscriber.create()`](#subscriptions).

```js
scanpay.paymentLink.create({
        orderid: 'inv--001',
        items: [{
            name: 'iPhone',
            total: '6995.95 DKK'
        }]
    })
    .then(res => console.log(res.url))
    .catch(err => console.error(err));
```

#### paymentLink.delete(string, options)
Delete a payment link. **Not implemented yet; ETA: 2022-07**

```js
scanpay.paymentLink.delete('https://betal.scanpay.dk/ax18s0')
    .then(() => console.log('Link deleted'))
    .catch(err => console.error(err));
```

### Transactions
Transactions are created when payment links are paid or when you charge a subscriber. You can manage your transactions in our [dashboard](https://dashboard.scanpay.dk) and with the following methods:

#### transaction.capture(integer, object, options)
Fully or partially capture an authorized amount of a transaction. You need to include the transaction `index`, i.e. the number of captures and refunds on the transaction.

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
You can use our [Subscriptions API](https://docs.scanpay.dk/subscriptions/) to charge customers on a recurring basis, e.g. monthly, or to tokenize customer payment details for future checkouts, so-called "one-click" checkouts.

#### subscriber.create(object, options)
Create a link to the payment window, where the customer can enter their payment details. The subscriber is created when the payment details have been saved. ([docs](https://docs.scanpay.dk/subscriptions/create-subscriber) \| [example](tests/subscriptionLink.js)).

```js
scanpay.subscriber.create({
        subscriber: { ref: 'customer8' } // Your own reference
    })
    .then(res => console.log(res.url))
    .catch(err => console.error(err));
```

#### subscriber.charge(integer, object, options)
Charge an amount from an existing subscriber. Charges are authorizations, so you have to capture the transaction afterwards or use auto-capture. Please use [idempotency](#idempotency) to prevent accidental charges. ([docs](https://docs.scanpay.dk/subscriptions/charge-subscriber) \| [example](tests/charge.js)):

```js
const options = {
    idempotency: db.invoices['inv-39'].idempotencyKey;
};
scanpay.subscriber.charge(5, {
        orderid: 'inv-39',
        items: [{
            name: 'flixNet subscription',
            total: '299.95 DKK'
        }]
    }, options)
    .then(res => console.log(res))
    .catch(err => console.error(err));
```

#### subscriber.renew(integer, object, options)
Create a link to the payment window, where the subscriber can renew or change their payment details. ([docs](https://docs.scanpay.dk/subscriptions/renew-subscriber) \| [example](tests/renew.js)):

```js
scanpay.subscriber.renew(5, {
        successurl: 'http://blixen.dk/card-renewed'
    })
    .then(res => console.log(res.url))
    .catch(err => console.error(err));
```

#### subscriber.delete(integer, options)
Delete a subscriber. **Not implemented yet; ETA: 2022-07**

```js
scanpay.subscriber.delete(5)
    .then(() => console.log('subscriber deleted!'))
    .catch(err => console.error(err));
```

### Synchronization
Our synchronization paradigm *(“ping-pull”)* is a hybrid of push and pull. In short, we *ping* you with a sequence number, both periodically and after events. The sequence number is a counter that increases when your transaction data changes. When this happens, you pull the changes from our backend. Please read [the details](https://docs.scanpay.dk/synchronization) before you begin.

#### sync.parsePing(string, string, options)
Securely validate and parse the ping body with the corresponding `X-Signature` HTTP header. Authentic pings return a JSON object with your sequence number, `seq`, which you can use to determine if you are synchronized. ([docs](https://docs.scanpay.dk/synchronization#ping-service) \| [example](tests/handlePing.js)).

```js
scanpay.sync.parsePing(body, headers['x-signature'])
    .then((ping) => {
        console.log(ping);  // output: { "shopid": 1153, "seq": 119 }
        if (ping.seq > db.scanpaySeqNum) console.log('Pull changes!');
    })
    .catch((err) => {
        if (err.type !== 'ScanpayInvalidPing') console.log(err);
    });
```

#### sync.pull(integer, options)
Pull an array of changes after a specific `seq`. ([docs](https://docs.scanpay.dk/synchronization#sequence-request) \| [example](tests/seq.js)).

```js
scanpay.sync.pull(119)
    .then(obj => {
        console.log(obj); // output: { "seq": 120, changes: [{…}] }
    })
    .catch(err => console.error(err));
```


## Options

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
