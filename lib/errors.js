/*
    Scanpay Node.js client library (Node >= v6.6.0)
    Docs: https://docs.scanpay.dk/
    help@scanpay.dk || irc.libera.chat:6697 #scanpay
*/

'use strict';

class ScanpayError extends Error {
    constructor(raw = {}) {
        super(raw.message);
        this.type = this.constructor.name;
        if (raw.payload) this.payload = raw.payload;
        if (raw.response) this.response = raw.response;
    }
}

class ScanpayInputError extends ScanpayError {}
class ScanpayServerError extends ScanpayError {}
class ScanpaySignatureError extends ScanpayError {}


module.exports.ScanpayError = ScanpayError;
module.exports.ScanpayInputError = ScanpayInputError;
module.exports.ScanpayServerError = ScanpayServerError;
module.exports.ScanpaySignatureError = ScanpaySignatureError;
