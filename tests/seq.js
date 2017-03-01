/*
    Scanpay ApS
    Node >= 4.4.5 (Arrow functions & Let)
*/
const apikey = ' API KEY ';
const scanpay = require('../')(apikey);

let localseq = 0;
const options = {
    // hostname: 'api.scanpay.dk', // Override default
    headers: {
        'X-Cardholder-IP': '189.127.159.146' // Customer IP address
    }
};

scanpay.seq(localseq, options).then(res => {
    console.log(res);
});
