# Scanpay node.js client

This is a Node.js (>=v6.6) client library for the Scanpay API. You can find the documentation at [docs.scanpay.dk](https://docs.scanpay.dk/).

## Installation

```bash
npm install scanpay
```

To create a payment link all you need to do is:

```js
const scanpay = require('scanpay')(' API key ');
const order = {
    items: [{
        name: 'iPhone 6+',
        quantity: 1,
        price: '6000 DKK'
    }]
};

scanpay.newURL(order).then(url => { console.log(url); });
```

## Compatibility table

Nodejs compatibility table.

| Feature                           | Version |
| :-------------------------------- | :-----: |
| crypto.timingSafeEqual            | 6.6     |
| Arrow functions                   | 6.0     |
| Default function parameters       | 6.0     |
| Array.isArray                     | 6.0     |
| Buffer.from                       | 5.10    |
| Let and Const                     | 4.0     |
| Object literal ext.               | 4.0     |
| Number.isInteger                  | 0.12.18 |
| Promises                          | 0.12    |
| https.request                     | 0.3.6   |
| crypto.createHmac                 | 0.1.94  |

## License

Everything in this repository is licensed under the [MIT license](LICENSE).

