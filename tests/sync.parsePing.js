/*
    Scanpay Node.js client library (Node >= v6.6.0)
    Docs: https://docs.scanpay.dk/
    help@scanpay.dk || irc.libera.chat:6697 #scanpay
*/

const apikey = '1153:YHZIUGQw6NkCIYa3mG6CWcgShnl13xuI7ODFUYuMy0j790Q6ThwBEjxfWFXwJZ0W';
const scanpay = require('../')(apikey);
const http = require('http');

const options = {
    debug: true
};

const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
        try {
            const json = scanpay.handlePing(
                body,
                req.headers['x-signature'],
                options
            );
            console.log('Ping:\n' + JSON.stringify(json, null, 4) + '\n');
        } catch (e) {
            console.log(e);
        }
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end();
    });
});

server.listen(8080);
