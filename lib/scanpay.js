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
    ScanpaySignatureError
} = require('./errors.js');
let apikey;

/* generateIdempotencyKey: Generate an idempotency key to identify a request uniquely */
function generateIdempotencyKey() {
    return crypto.randomBytes(32).toString('base64').replace('=', '');
}

function isObj(arg) {
    return typeof arg === 'object' && arg !== null;
}

/*  timingSafeEquals: Authenticate message without leaking metadata */
function timingSafeEquals(msg, s2) {
    const s1 = crypto.createHmac('sha256', apikey).update(msg).digest('base64');
    return s1.length === s2.length &&
        crypto.timingSafeEqual(Buffer.from(s1), Buffer.from(s2));
}

function validatePaymentLink(res) {
    if (typeof res.url !== 'string' || res.url.slice(0, 5) !== 'https') {
        throw new ScanpayServerError({
            message: 'invalid response from server',
            response: res
        });
    }
    return res;
}

/*  request: fetch-like HTTP request function */
function request(path, data, opts) {
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
                    message: 'invalid idempotency-status'
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


module.exports = (key) => {
    apikey = key;

    return {
        paylink: {
            create: (data, opts = {}) => {
                if (!isObj(data)) throw new TypeError('1st argument is not an Object');
                if (!isObj(opts)) throw new TypeError('2nd argument is not an Object');
                if (!Array.isArray(data.items)) throw new TypeError('"items" is not an Array');

                return request('/v1/new', data, opts)
                    .then(validatePaymentLink);
            },

            // delete: () => console.log('not implemented yet.'),
        },

        transaction: {
            capture: (trnID, data, opts = {}) => {
                if (!Number.isInteger(trnID)) throw new TypeError('1st argument is not an Integer');
                if (!isObj(data)) throw new TypeError('2nd argument is not an Object');
                if (!isObj(opts)) throw new TypeError('3rd argument is not an Object');
                if (isNaN(data.index)) throw new TypeError('index is not a number');

                return request('/v1/transactions/' + trnID + '/capture', data, opts);
            },

            // refund: () => console.log('not implemented yet.'),

            // void: () => console.log('not implemented yet.'),
        },

        subscriber: {
            create: (data, opts = {}) => {
                if (!isObj(data)) throw new TypeError('1st argument is not an Object');
                if (!isObj(opts)) throw new TypeError('2nd argument is not an Object');
                if (!isObj(data.subscriber)) throw new TypeError('.subscriber is not an Object');

                return request('/v1/new', data, opts)
                    .then(validatePaymentLink);
            },

            charge: (subID, data, opts = {}) => {
                if (!Number.isInteger(subID)) throw new TypeError('1st argument is not an Integer');
                if (!isObj(data)) throw new TypeError('2nd argument is not an Object');
                if (!isObj(opts)) throw new TypeError('3rd argument is not an Object');
                if (!Array.isArray(data.items)) throw new TypeError('.items is not an Array');

                if (opts.idempotency) {
                    if (!opts.headers) opts.headers = {};
                    opts.headers['Idempotency-Key'] = opts.idempotency;
                }
                return request('/v1/subscribers/' + subID + '/charge', data, opts);
            },

            renew: (subID, data, opts = {}) => {
                if (!Number.isInteger(subID)) throw new TypeError('1st argument is not an Integer');
                if (!isObj(data)) throw new TypeError('2nd argument is not an Object');
                if (!isObj(opts)) throw new TypeError('3rd argument is not an Object');

                return request('/v1/subscribers/' + subID + '/renew', data, opts)
                    .then(validatePaymentLink);
            }
        },

        sync: {
            parsePing: (msg = '', signature = '', opts = {}) => {
                if (typeof signature !== 'string') throw new TypeError('2nd argument is not an Object');
                if (!isObj(opts)) throw new TypeError('3rd argument is not an Object');

                return new Promise((resolve, reject) => {
                    if (!timingSafeEquals(msg, signature)) {
                        return reject(new ScanpaySignatureError({
                            message: 'message has invalid signature'
                        }));
                    }
                    try {
                        const ping = JSON.parse(msg);
                        if (!Number.isInteger(ping.seq)) {
                            throw new ScanpayServerError({
                                message: 'invalid data received from scanpay'
                            });
                        }
                        return ping;
                    } catch (e) {
                        throw new ScanpayServerError({
                            message: 'invalid data received from scanpay'
                        });
                    }
                })
            },

            pull: (seq, opts = {}) => {
                if (!Number.isInteger(seq)) throw new TypeError('1st argument is not an Integer');
                if (!isObj(opts)) throw new TypeError('2nd argument is not an Object');

                return request('/v1/seq/' + seq, null, opts).then((res) => {
                    if (!Array.isArray(res.changes) || !Number.isInteger(res.seq)) {
                        throw new ScanpayServerError({
                            message: 'invalid response from scanpay'
                        });
                    }
                    return res;
                });
            }
        },

        generateIdempotencyKey,
    };
};
