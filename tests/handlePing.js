/*
    help@scanpay.dk || irc.scanpay.dk:6697 || Freenode #scanpay
*/
const apikey = '1153:YHZIUGQw6NkCIYa3mG6CWcgShnl13xuI7ODFUYuMy0j790Q6ThwBEjxfWFXwJZ0W';
const scanpay = require('../')(apikey);
const http = require('http');

const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            const json = scanpay.handlePing(body, req.headers['x-signature']);
            console.log('Received ping:\n' + JSON.stringify(json, null, 4) + '\n');
        } catch (e) {
            console.log(e);
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end();
    });
});

server.listen(8080);
