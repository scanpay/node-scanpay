/*
    Scanpay Node.js client library (Node >= v6.6.0)
    Docs: https://docs.scanpay.dk/
    help@scanpay.dk || irc.libera.chat:6697 #scanpay
*/

const version = 'nodejs-2.0.0';
const https = require('https');
const crypto = require('crypto');
const {
    ScanpayError,
    ScanpayServerError,
    ScanpayInputError,
    ScanpaySignatureError
} = require('./errors.js');
let apikey;

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
function request(path, opts = {}, data = null) {
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
            if (res.statusCode !== 200) {
                return reject(new ScanpayError({
                    message: res.statusMessage,
                    payload: (opts.debug) ? data : null
                }));
            }

            if (req.hasHeader('idempotency-key')
                && res.headers['idempotency-status'] !== 'OK'
            ) {
                return reject(new ScanpayServerError({
                    message: 'invalid idempotency-status',
                    payload: (opts.debug) ? data : null
                }));
            }

            let body = '';
            res.on('data', chunk => (body += chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    return reject(new ScanpayServerError({
                        message: 'invalid response from server',
                        payload: (opts.debug) ? data : null,
                        response: (opts.debug) ? body : null
                    }));
                }
            });
        });

        req.on('socket', (socket) => {
            socket.setTimeout(60000); // 60s
            socket.on('timeout', () => req.abort());
        });

        req.on('error', e => reject(new ScanpayError({
            message: 'connection failed: ' + e
        })));
        if (data) req.write(o.body);
        req.end();
    });
}


/*  newURL: Create a new payment link */
function newURL(data = {}, opts = {}) {
    return request('/v1/new', opts, data).then((res) => {
        if (!res.url || res.url.slice(0, 5) !== 'https') {
            throw new ScanpayServerError({
                message: 'invalid response from scanpay',
                payload: (opts.debug) ? data : null,
                response: res
            });
        }
        return res.url;
    });
}


/*  paymentLink: Create a new payment link */
function paymentLink(data, opts = {}) {
    if (typeof data !== 'object') {
        return Promise.reject(new ScanpayInputError({
            message: 'invalid input',
            payload: (opts.debug) ? data : null
        }));
    }
    // Items array is required.
    if (!Array.isArray(data.items) || !data.items.length) {
        return Promise.reject(new ScanpayInputError({
            message: 'invalid items',
            payload: (opts.debug) ? data : null
        }));
    }
    return newURL(data, opts);
}


/*  subscriptionLink: Create a subscription link */
function subscriptionLink(data, opts = {}) {
    if (typeof data !== 'object') {
        return Promise.reject(new ScanpayInputError({
            message: 'invalid input',
            payload: (opts.debug) ? data : null
        }));
    }
    if (!data.subscriber) {
        return Promise.reject(new ScanpayInputError({
            message: 'subscriber is missing',
            payload: (opts.debug) ? data : null
        }));
    }
    if (Array.isArray(data.items)) {
        return Promise.reject(new ScanpayInputError({
            message: 'items[] not allowed in subscriptionLink',
            payload: (opts.debug) ? data : null
        }));
    }
    return newURL(data, opts);
}


/*  seq: Get array of changes since $seq */
function seq(seq, opts = {}) {
    // Check if seq is a natural number (String|Int.)
    if (seq != parseInt(seq, 10)) {
        return Promise.reject(new ScanpayInputError({
            message: 'invalid seq',
            payload: seq
        }));
    }
    return request('/v1/seq/' + seq, opts).then((res) => {
        if (!Array.isArray(res.changes) || !Number.isInteger(res.seq)) {
            throw new ScanpayServerError({
                message: 'invalid response from scanpay',
                payload: seq,
                response: (opts.debug) ? res : null
            });
        }
        return res;
    });
}

/* charge: Charge an amount from a subscriber */
function charge(subID, data = {}, opts = {}) {
    // Check if subID is a natural number (String|Int.)
    if (subID != parseInt(subID, 10)) {
        return Promise.reject(new ScanpayInputError({
            message: 'invalid subscriberID',
            payload: subID
        }));
    }
    if (!Array.isArray(data.items) || !data.items.length) {
        return Promise.reject(new ScanpayInputError({
            message: 'invalid items',
            payload: data
        }));
    }
    return request('/v1/subscribers/' + subID + '/charge', opts, data);
}


/* renew: Renew the payment method for an existing subscriber */
function renew(subID, data = {}, opts = {}) {
    // Check if subID is a natural number (String|Int.)
    if (subID != parseInt(subID, 10)) {
        return Promise.reject(new ScanpayInputError({
            message: 'invalid subscriberID',
            payload: subID
        }));
    }

    if (typeof data !== 'object') {
        return Promise.reject(new ScanpayInputError({
            message: 'invalid input',
            payload: (opts.debug) ? data : null
        }));
    }

    return request('/v1/subscribers/' + subID + '/renew', opts, data)
        .then((res) => {
            if (!res.url || res.url.slice(0, 5) !== 'https') {
                throw new ScanpayServerError({
                    message: 'invalid response from scanpay',
                    payload: data
                });
            }
            return res.url;
        });
}


/*  handlePing: Convert to JSON and validate data. */
function handlePing(msg = '', signature = '', opts = {}) {
    if (!timingSafeEquals(msg, signature)) {
        throw new ScanpaySignatureError({
            message: 'invalid signature',
            payload: (opts.debug) ? msg : null,
            signature: (opts.debug) ? signature : null
        })
    }

    try {
        const ping = JSON.parse(msg);
        if (!Number.isInteger(ping.seq)) {
            throw new ScanpayServerError({
                message: 'invalid ping received',
                payload: (opts.debug) ? ping : null
            });
        }
        return ping;
    } catch (error) {
        throw new ScanpayServerError({
            message: 'invalid ping received',
            payload: (opts.debug) ? msg : null
        });
    }
}


module.exports = (key) => {
    apikey = key;
    return {
        newURL, paymentLink, subscriptionLink,
        seq,
        handlePing,
        charge,
        renew,
        generateIdempotencyKey,
    };
};
