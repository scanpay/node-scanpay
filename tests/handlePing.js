/*
    Scanpay ApS
    Node >= 4.4.5 (Arrow functions & Let)
*/
const apikey = ' API KEY ';
const scanpay = require('../')(apikey);
const http = require('http');

const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });

    req.on('end', () => {
        let reqObj;
        try {
            reqObj = scanpay.handlePing(body, req.headers['x-signature']);
            console.log('Received ping:\nseq=' + reqObj.seq + '\nshopid=' + reqObj.shopid + '\n');
        } catch (e) {
            console.log('Error while processing request: ' + e + '\n');
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end();
    });

});

server.listen(8080);
