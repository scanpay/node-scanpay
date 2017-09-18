# Scanpay node.js client

This is a Node.js client library for the Scanpay API. You can find the documentation at [docs.scanpay.dk](https://docs.scanpay.dk/). You can create a free account at [en.scanpay.dk/signup](https://en.scanpay.dk/signup).

## Installation

This package works with Node.js >= 6.6. Install the package with npm:

```bash
npm install scanpay --save
```
and include it in your project.

```js
const scanpay = require('scanpay')(' API key ');
```

## Methods

All methods, except `handlePing`, are async and will return a promise or throw an error. All async methods accept optional per-request `options` for [https.request()](https://nodejs.org/api/http.html#http_http_request_options_callback). You can use this to:

* Set the API key for this request ([example](https://github.com/scanpaydk/node-scanpay/blob/master/tests/newURL.js#L8))
* Set HTTP headers, e.g. the highly recommended `X-Cardholder-IP` ([example](https://github.com/scanpaydk/node-scanpay/blob/master/tests/newURL.js#L11))
* Change the hostname to use our test environment `api.test.scanpay.dk` ([example](https://github.com/scanpaydk/node-scanpay/blob/master/tests/newURL.js#L9))

#### newURL(Object, Object) => String

Create a payment link by passing the order details ([spec](https://docs.scanpay.dk/payment-link#request-fields)) through `newURL`:

```js
const order = {
    items: [{
        name: 'iPhone 6+',
        quantity: 2,
        price: '6000 DKK'  // Total is 12000 DKK
    }]
};
scanpay.newURL(order, options).then(url => console.log(url));
```

#### seq(Int, Object) => Object

Get an array with a number of changes since the supplied sequence number argument:

```js
const localSeq = 921; // A counter stored in your database.
scanpay.seq(localSeq, options).then(obj => {
    console.log(obj.changes);
    console.log('New local seq after applying all changes: ' + obj.seq);
});
```

#### maxSeq(Object) => Integer

Get the current maximum sequence number:

```js
scanpay.maxSeq(options).then(int => console.log(int));
```

#### handlePing(String, String)

Securely and efficiently validate pings. This method return a JSON object:

```js
const json = scanpay.handlePing(body, req.headers['x-signature']);
console.log(json.seq);
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
| Let and Const                     | 4.0     |
| Object literal ext.               | 4.0     |


## License

Everything in this repository is licensed under the [MIT license](LICENSE).
