# Scanpay node.js client

This is a node.js client library for Scanpay. You can find the documentation at [docs.scanpay.dk](https://docs.scanpay.dk/).

## Installation

`npm install scanpay`

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
