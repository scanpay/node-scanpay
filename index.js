/*
    Scanpay: NodeJS SDK:
    Node >= 4.4.5: Arrow functions, Let, Promises (4.0+)
*/

const version = 'nodejs-1.1.0';
const https = require('https');
const crypto = require('crypto');

function merge(obj1, obj2) {
    for (let o in obj2) {
        if (typeof obj2[o] === 'object') {
            merge(obj1[o], obj2[o]);
        } else {
            obj1[o] = obj2[o];
        }
    }
    return obj1;
}

function constTimeEquals(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    if (typeof crypto.timingSafeEqual === 'function') {
        return crypto.timingSafeEqual(new Buffer(a), new Buffer(b));
    }
    let neq = 0;
    for (let i = 0; i < a.length; i++) {
        neq |= a[i] ^ b[i];
    }
    return !neq;
}

function request(opts, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(opts, (res) => {

            // handle http errors
            if (res.statusCode !== 200) {
                if (res.statusCode === 403) {
                    return reject('invalid API-key');
                }
                return reject(res.statusCode + ' ' + res.statusMessage);
            }

            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                let json;
                try {
                    json = JSON.parse(body);
                } catch (e) {
                    reject('unable to parse JSON, ' + e);
                    return;
                }
                if (json.error) {
                    reject(json.error);
                    return;
                }
                resolve(json);
            });
        });

        // Timeout after 30 seconds
        req.on('socket', (socket) => {
            socket.setTimeout(30000);
            socket.on('timeout', () => { req.abort(); });
        });

        // handle connection errors of the req
        req.on('error', (err) => reject('no connection to server'));
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}


module.exports = function (apikey) {
    const module = {};

    module.newURL = function (data, opts) {
        const options = {
            hostname: 'api.scanpay.dk',
            path: '/v1/new',
            method: 'POST',
            auth: apikey,
            headers: {
                'Content-Type': 'application/json',
                'X-Scanpay-SDK': version
            }
        };
        if (opts) { merge(options, opts); }

        return request(options, data).then((o) => {
            if (o.url) {
                return o.url;
            }
            throw 'internal server error: missing fields';
        });
    };

    module.seq = function (seq, opts) {
        const options = {
            hostname: 'api.scanpay.dk',
            path: '/v1/seq/' + seq,
            auth: apikey,
            headers: {
                'X-Scanpay-SDK': version
            }
        };
        if (opts) { merge(options, opts); }

        return request(options).then((o) => {
            if (typeof o.seq === 'number' && o.changes.constructor === Array) {
                return o;
            }
            throw 'internal server error: missing fields';
        });
    };

    module.handlePing = function (body, signature='') {
        const mySig = crypto.createHmac('sha256', apikey)
            .update(body)
            .digest('base64');
        if (!constTimeEquals(mySig, signature)) {
            throw 'invalid signature';
        }

        let reqObj = JSON.parse(body);
        if (reqObj.seq !== parseInt(reqObj.seq) ||
            reqObj.shopid !== parseInt(reqObj.shopid) ||
            reqObj.seq < 0 || reqObj.shopid < 0) {
            throw 'missing or invalid fields';
        }
        return reqObj;
    };

    return module;
};
