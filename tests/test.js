/*
    Scanpay ApS
    Node >= 4.4.5 (Arrow functions & Let)
*/
const apikey = ' API KEY ';
const scanpay = require('../')(apikey);

const order = {
    orderid: 'a766409',
    language: '',
    successurl: 'https://example.dk/success',
    items: [
        {
            name: 'Pink Floyd: The Dark Side Of The Moon',
            quantity: 2,
            price: '99.99 DKK',
            sku: 'fadf23',
        }, {
            name: '巨人宏偉的帽子',
            quantity: 2,
            price: '420 DKK',
            sku: '124',
        }
    ],
    billing: {
        name: 'John Doe',
        company: 'The Shop A/S',
        email: 'john@doe.com',
        phone: '+4512345678',
        address: ['Langgade 23, 2. th'],
        city: 'Havneby',
        zip: '1234',
        state: '',
        country: 'DK',
        vatin: '35413308',
        gln: '7495563456235'
    },
    shipping: {
        name: 'Jan Dåh',
        company: 'The Choppa A/S',
        email: 'jan@doh.com',
        phone: '+45 87654321',
        address: ['Langgade 23, 1. th', 'C/O The Choppa'],
        city: 'Haveby',
        zip: '1235',
        state: '',
        country: 'DK'
    },
};

const options = {
    hostname: 'api.test.scanpay.dk', // Override default
    headers: {
        'X-Cardholder-IP': '189.127.159.146' // Customer IP address
    }
};

// Hack: Only needed for https.Agent() because of self-signed cert.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

scanpay.newURL(order, options).then(res => {
    console.log('newURL: ' + res.url);
}, err => {
    console.log('newURL error: ' + err);
});

scanpay.seq(10, options).then(res => {
    console.log('seq: ' + res.seq);
}).catch(err => {
    console.log('seq error: ' + err);
});
