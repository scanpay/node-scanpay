/*
    Scanpay Node.js client library (Node >= v6.6.0)
    Docs: https://docs.scanpay.dk/
    help@scanpay.dk || irc.libera.chat:6697 #scanpay
*/

const apikey = '1153:YHZIUGQw6NkCIYa3mG6CWcgShnl13xuI7ODFUYuMy0j790Q6ThwBEjxfWFXwJZ0W';
const scanpay = require('../')(apikey);

const options = {
    hostname: 'api.test.scanpay.dk',
};

const data = {
    total: '1.95 DKK',
    index: 1
};

scanpay.transaction.capture(726, data, options)
    .then(res => console.log(res))
    .catch(err => console.log(err));

