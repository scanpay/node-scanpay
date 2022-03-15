/*
    Scanpay Node.js client library (Node >= v6.6.0)
    Docs: https://docs.scanpay.dk/
    help@scanpay.dk || irc.libera.chat:6697 #scanpay
*/

const apikey = '1153:YHZIUGQw6NkCIYa3mG6CWcgShnl13xuI7ODFUYuMy0j790Q6ThwBEjxfWFXwJZ0W';
const scanpay = require('../')(apikey);

const options = {
    // Set hostname (only needed for test env.)
    hostname: 'api.test.scanpay.dk',

    // Set an API key for this request (optional)
    auth: apikey,

    // Set headers
    headers: {
        'X-Cardholder-IP': '189.127.159.146' // Customer IP address
    },

    // Flag for debugging
    debug: true
};

const data = {
    items: [
        {
            total: '200 DKK'
        }
    ],
};


(async () => {
    await scanpay.paymentLink(data, options)
        .then((url) => {
            console.log('payment link: ' + url);
        })
        .catch((err) => {
            console.log(err);
        });

})();
