/*
    Scanpay Node.js client library (Node >= v6.6.0)
    Docs: https://docs.scanpay.dk/
    help@scanpay.dk || irc.libera.chat:6697 #scanpay
*/

const apikey = '6145:NuzXfh1NlbOS/ix5L9gExfPlc8KOQXZ9i43e30HSFoIspKPFaeb2Is4WzCqfCA5Q';
const scanpay = require('../')(apikey);
const http = require('http');

const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
        res.writeHead(200);
        res.end();

        // We want to close the connection ASAP and parse the ping
        // asynchronously to limit exposure to side-channel attacks.
        scanpay.sync.parsePing(body, req.headers['x-signature'])
            .then(json => console.log(json))
            .catch((err) => {
                if (err.type !== 'ScanpaySignatureError') console.log(err);
                else console.log(err); // Invalid pings
            });
    });
});

server.on('connection', (sock) => {
    // Only allow scanpay IPs (optional)
    if (!scanpay.ip(sock.remoteAddress)) {
        console.log('invalid ping IP!!');
        sock.destroy();
    }
});

// Protect against DoS attacks
server.headersTimeout = 2000;
server.requestTimeout = 3000;
server.maxHeaderSize = 2000;

// We batch pings, but you can still receive
// up to 100 pings per minute, so keep-alive
// is a good idea.
server.keepAliveTimeout = 60000;

server.listen(8080);

