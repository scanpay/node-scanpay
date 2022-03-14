/*
    Scanpay Node.js client library (Node >= v6.6.0)
    Docs: https://docs.scanpay.dk/
    help@scanpay.dk || irc.libera.chat:6697 #scanpay
*/
const apikey = '1153:YHZIUGQw6NkCIYa3mG6CWcgShnl13xuI7ODFUYuMy0j790Q6ThwBEjxfWFXwJZ0W';
const scanpay = require('../')(apikey);

const options = {
    auth: apikey, // Set an API key for this request (optional)
    hostname: 'api.test.scanpay.dk',
    headers: {
        'X-Cardholder-IP': '189.127.159.146' // Customer IP address
    }
};

const subscriber = {
    orderid: 'a766409',
    language: 'da',
    successurl: 'https://blixen.dk/',
    subscriber: {
        ref: 'sub123',
    },
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

scanpay.newURL(subscriber, options).then((url) => {
    console.log('newURL-subscriber: ' + url);
}, (err) => {
    console.log(err);
});
