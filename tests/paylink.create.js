/*
    Scanpay Node.js client library (Node >= v6.6.0)
    Docs: https://docs.scanpay.dk/
    help@scanpay.dk || irc.libera.chat:6697 #scanpay
*/

const apikey = '1153:YHZIUGQw6NkCIYa3mG6CWcgShnl13xuI7ODFUYuMy0j790Q6ThwBEjxfWFXwJZ0W';
const scanpay = require('../')(apikey);

const options = {
    hostname: 'api.test.scanpay.dk',
    headers: {
        'X-Cardholder-IP': '189.127.159.146' // Customer IP address
    },
    debug: true
};

const data = {
    orderid: 'a766409',
    language: 'da',
    successurl: 'https://blixen.dk/',
    items: [
        {
            name: 'Pink Floyd: The Dark Side Of The Moon',
            quantity: 2,
            sku: 'abc123',
            total: '200 DKK'
        },
        {
            name: 'Æblekage',
            quantity: 3,
            sku: '123',
            total: '300 DKK'
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
        country: 'DK',
        vatin: '35413308',
        gln: '7495563456235'
    },
    shipping: {
        name: 'Jan Dåh',
        company: 'The Choppa A/S',
        email: 'jan@doh.com',
        phone: '+45 87654321',
        address: [
            'Langgade 23, 1. th',
            'C/O The Choppa'
        ],
        city: 'Haveby',
        zip: '1235',
        country: 'DK'
    }
};


(async () => {
    await scanpay.paylink.create(data, options)
        .then((res) => {
            console.log('payment link: ' + res.url);
        })
        .catch((err) => {
            console.log(err);
        });


    // Absolute minimal (not recommended)
    await scanpay.paylink.create({
        items: [{
            total: '200 DKK'
        }]
    }, options)
        .then(res => console.log('payment link: ' + res.url))
        .catch((err) => {
            console.log(err);
        });


    // Old scheme (DEPRECATED)
    await scanpay.paylink.create({
        items: [{
            price: '200 DKK',
            quantity: 2,
        }]
    }, options)
        .then(res => console.log('payment link: ' + res.url))
        .catch((err) => {
            console.log(err);
        });

})();
