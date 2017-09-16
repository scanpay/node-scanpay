/*
    Scanpay: NodeJS SDK
    help@scanpay.dk || irc.scanpay.dk:6697 || scanpay.dk/slack
    Node >= v6.6.0
*/
const version = 'nodejs-1.2.2';
const https = require('https');
const crypto = require('crypto');
let apikey;

/*  mergeObjs: Copy all properties of obj2 to obj1 */
function mergeObjs(obj1, obj2) {
    for (let o in obj2) {
        if (typeof obj2[o] === 'object') {
            mergeObjs(obj1[o], obj2[o]);
        } else {
            obj1[o] = obj2[o];
        }
    }
    return obj1;
}

/*  authMsg: Authenticate message without leaking metadata */
function authMsg(msg, s2) {
    const s1 = crypto.createHmac('sha256', apikey).update(msg).digest('base64');
    return s1.length === s2.length &&
        crypto.timingSafeEqual(Buffer.from(s1), Buffer.from(s2));
}

/*  throwError: Handle scanpay errors */
function throwError(str) {
    // TODO: Send report to scanpay
    throw new Error('invalid response from scanpay; ' + str);
}

/*  request: fetch-like HTTP request function */
function request(path, opts={}, data=null) {
    return new Promise((resolve, reject) => {
        const o = {
            hostname: 'api.scanpay.dk',
            path: path,
            auth: apikey,
            headers: {
                'X-SDK': version + '/' + process.version
            }
        };
        mergeObjs(o, opts);
        if (data) {
            o.body = JSON.stringify(data);
            o.method = 'POST';
            o.headers['Content-Length'] = Buffer.byteLength(o.body);
        }

        const req = https.request(o, (res) => {
            if (res.statusCode !== 200) {
                return reject(res.statusMessage);
            }
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error('unable to parse JSON response'));
                }
            });
        });

        req.on('socket', (socket) => {
            socket.setTimeout(30000); // 30s
            socket.on('timeout', () => req.abort());
        });

        // handle connection throwErrorors of the req
        req.on('error', (e) => reject('connection failed: ' + e));
        if (data) { req.write(o.body); }
        req.end();
    });
}


/*  newURL: Create a new payment link */
function newURL(data, opts) {
    return request('/v1/new', opts, data)
    .then((o) => {
        if (!o.url || o.url.slice(0, 8) !== 'https://') {
            throwError('missing url');
        }
        return o.url;
    });
}

/*  seq: Get array of changes since $seq */
function seq(seq, opts) {
    if (!Number.isInteger(seq)) {
        throw new Error('seq argument must be integer');
    }
    return request('/v1/seq/' + seq, opts)
    .then((o) => {
        if (!Array.isArray(o.changes)) { throwError('missing changes[]'); }
        if (!Number.isInteger(o.seq)) { throwError('missing seq'); }
        return o;
    });
}

/*  maxSeq: Get maximum seq */
function maxSeq(opts) {
    return request('/v1/seq', opts)
    .then((o) => {
        if (!Number.isInteger(o.seq)) {
            throwError('missing seq');
        }
        return o.seq;
    });
}

/*  handlePing: Convert to JSON and validate data and integrity. */
function handlePing(msg, signature='') {
    if (!authMsg(msg, signature)) {
        throw 'invalid signature';
    }
    const o = JSON.parse(msg);
    if (!Number.isInteger(o.seq)) { throwError('missing seq'); }
    if (!Number.isInteger(o.shopid)) { throwError('missing shopid'); }
    return o;
}

module.exports = (key) => {
    apikey = key;
    return { newURL, seq, maxSeq, handlePing };
};
