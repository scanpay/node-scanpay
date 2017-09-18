/*
    help@scanpay.dk || irc.scanpay.dk:6697 || scanpay.dk/slack
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

const order = {
    orderid: 'a766409',
    language: 'da',
    successurl: 'http://blixen.dk/success',
    items: [
        {
            name: 'Pink Floyd: The Dark Side Of The Moon',
            quantity: 2,
            price: '99.99 DKK',
            sku: 'fadf23'
        },
        {
            name: '巨人宏偉的帽子',
            quantity: 2,
            price: '420 DKK',
            sku: '124'
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

scanpay.newURL(order, options).then((url) => {
    console.log('newURL: ' + url);
}, (err) => {
    console.log(err);
});
