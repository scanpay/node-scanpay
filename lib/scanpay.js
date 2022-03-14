/*
    Scanpay Node.js client library (Node >= v6.6.0)
    Docs: https://docs.scanpay.dk/
    help@scanpay.dk || irc.libera.chat:6697 #scanpay
*/
const version = 'nodejs-1.3.0';
const https = require('https');
const crypto = require('crypto');
let apikey;

class IdempotentResponseError extends Error {
    constructor(message) {
        super(message);
        this.name = "IdempotentResponseError";
    }
}

/* generateIdempotencyKey: Generate an idempotency key to identify a request uniquely */
function generateIdempotencyKey() {
    return crypto.randomBytes(32).toString('base64').replace('=', '');
}

/*  timingSafeEquals: Authenticate message without leaking metadata */
function timingSafeEquals(msg, s2) {
    const s1 = crypto.createHmac('sha256', apikey).update(msg).digest('base64');
    return s1.length === s2.length &&
        crypto.timingSafeEqual(Buffer.from(s1), Buffer.from(s2));
}

/*  request: fetch-like HTTP request function */
function request(path, opts={}, data=null) {
    return new Promise((resolve, reject) => {
        const o = {
            hostname: (opts.hostname) ? opts.hostname : 'api.scanpay.dk',
            path: path,
            auth: (opts.auth) ? opts.auth : apikey,
            headers: {
                'x-sdk': version + '/' + process.version,
                'content-type': 'application/json'
            }
        };
        if (opts.headers) {
            for (const key in opts.headers) {
                o.headers[key.toLowerCase()] = opts.headers[key];
            }
        }
        if (data) {
            o.body = JSON.stringify(data);
            o.method = 'POST';
            o.headers['content-length'] = Buffer.byteLength(o.body);
        }

        const req = https.request(o, (res) => {
            if (req.hasHeader('idempotency-key')) {
                switch (res.headers['idempotency-status']) {
                    case 'OK':
                        break;
                    case 'ERROR':
                        reject(new Error('Server failed to provide idempotency - ' + res.statusMessage));
                        return;
                    case undefined:
                        reject(new Error('missing response idempotency status - ' + res.statusMessage));
                        return;
                    default:
                        reject(new Error('Server returned unknown idempotency status "' +
                               res.headers['Idempotency-Status'] + "' - " + res.statusMessage));
                        return;
                }
            }
            if (res.statusCode !== 200) {
                return reject(new IdempotentResponseError(res.statusMessage));
            }
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new IdempotentResponseError('unable to parse JSON response'));
                }
            });
        });

        req.on('socket', (socket) => {
            socket.setTimeout(20000); // 20s
            socket.on('timeout', () => req.abort());
        });

        req.on('error', e => reject(new Error('connection failed: ' + e)));
        if (data) { req.write(o.body); }
        req.end();
    });
}

/*  newURL: Create a new payment link */
function newURL(data, opts) {
    return request('/v1/new', opts, data).then((o) => {
        if (o.url && o.url.slice(0, 5) === 'https') { return o.url; }
        throw new Error('received invalid url from server.');
    });
}

/*  seq: Get array of changes since $seq */
function seq(seq, opts) {
    if (!Number.isInteger(seq)) { throw 'invalid first argument'; }
    return request('/v1/seq/' + seq, opts).then((o) => {
        if (Array.isArray(o.changes) && Number.isInteger(o.seq)) { return o; }
        throw new Error('received invalid seq from server.');
    });
}

/*  handlePing: Convert to JSON and validate data. */
function handlePing(msg, signature='') {
    if (!timingSafeEquals(msg, signature)) { throw 'invalid signature'; }
    const o = JSON.parse(msg);
    if (Number.isInteger(o.seq + o.shopid)) { return o; }
    throw new Error('received invalid ping from server.');
}

/* charge: Charge an amount from a subscriber */
function charge(subid, data, opts) {
    if (!Number.isInteger(subid)) {
        throw new Error('subid argument must be integer');
    }
    return request('/v1/subscribers/' + subid + '/charge', opts, data);
}

/* charge: Renew the payment method for an existing subscriber */
function renew(subid, data, opts) {
    return request('/v1/subscribers/' + subid + '/renew', opts, data).then((o) => {
        if (o.url && o.url.slice(0, 5) === 'https') { return o.url; }
        throw new Error('received invalid url from server.');
    });
}

module.exports = (key) => {
    apikey = key;
    return {
        newURL, seq, handlePing, charge, renew,
        IdempotentResponseError, generateIdempotencyKey , timingSafeEquals,
    };
};
