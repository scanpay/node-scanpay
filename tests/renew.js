/*
    help@scanpay.dk || irc.scanpay.dk:6697 || scanpay.dk/slack
*/
const apikey = '1089:bx2a4DATi8ad87Nm4uaxg5nggYA8J/Hv99CON977YiEdvYa6DmMwdoRPoYWyBJSi';
const scanpay = require('../')(apikey);

const subscriberid = 5;
const options = {
    auth: apikey, // Set an API key for this request (optional)
    hostname: 'api.test.scanpay.dk',
    headers: {
        'X-Cardholder-IP': '189.127.159.146' // Customer IP address
    }
};

const data = {
    language: 'da',
    successurl: 'https://blixen.dk/',
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

scanpay.renew(subscriberid, data, options).then((url) => {
    console.log('Subscriber renewal URL: ' + url);
}, (err) => {
    console.log(err);
});
