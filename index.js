/*
    Scanpay: NodeJS SDK
    help@scanpay.dk || irc.scanpay.dk:6697 || scanpay.dk/slack
    Node >= v6.6.0
*/
const version = 'nodejs-1.2.0';
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
    throw new Error('invalid response from scanpay; ' + str);
}

function request(opts, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(opts, (res) => {
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

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

function newURL(data, opts) {
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
    if (opts) { mergeObjs(options, opts); }

    return request(options, data).then((o) => {
        if (!o.url || o.url.slice(0, 8) !== 'https://') {
            throwError('missing url');
        }
        return o.url;
    });
}

function seq(seq, opts) {
    const seqIsInt = Number.isInteger(seq);
    const options = {
        hostname: 'api.scanpay.dk',
        path: seqIsInt ? '/v1/seq/' + seq : '/v1/seq/',
        auth: apikey,
        headers: {
            'X-Scanpay-SDK': version
        }
    };
    if (opts) { mergeObjs(options, opts); }

    return request(options).then((o) => {
        if (seqIsInt && !Array.isArray(o.changes)) {
            throwError('missing changes[]');
        }
        if (!Number.isInteger(o.seq)) {
            throwError('missing seq');
        }
        return o;
    });
}

function handlePing(msg, signature) {
    if (!signature || !authMsg(msg, signature)) {
        throw 'invalid signature';
    }
    const o = JSON.parse(msg);
    if (!Number.isInteger(o.seq)) { throwError('missing seq'); }
    if (!Number.isInteger(o.shopid)) { throwError('missing shopid'); }
    return o;
}

module.exports = (key) => {
    apikey = key;
    return { newURL, seq, handlePing };
};
