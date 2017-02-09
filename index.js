/*
    Scanpay: NodeJS SDK:
    Node >= 4.4.5: Arrow functions, Let, Promises (4.0+)
*/

const https = require('https');
const version = 'nodejs-1.0.1';

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

function request(opts, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(opts, (res) => {

            // handle http errors
            if (res.statusCode !== 200) {
                if (res.statusCode === 403) {
                    reject('Invalid API-key');
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
                    reject('Unable to parse JSON, ' + e);
                }
                if (json.error) {
                    reject(json.error);
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
        req.on('error', (err) => reject('No connection to server'));
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
                return o;
            }
            throw 'Internal Server Error';
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
            throw 'Internal Server Error';
        });
    };
    return module;
};
