/*
    Scanpay Node.js client library (Node >= v6.6.0)
    Docs: https://docs.scanpay.dk/
    help@scanpay.dk || irc.libera.chat:6697 #scanpay
*/

const apikey = '1153:YHZIUGQw6NkCIYa3mG6CWcgShnl13xuI7ODFUYuMy0j790Q6ThwBEjxfWFXwJZ0W';
const scanpay = require('../')(apikey);

let subscriberID = 68;
const data = {
    orderid: `${subscriberID}:#1337`,
    items: [
        {
            name: 'Flixnet subscription',
            total: '99.99 DKK'
        }
    ]
};

const options = {
    hostname: 'api.test.scanpay.dk',
    idempotency: scanpay.generateIdempotencyKey()
};

(async () => {
    await scanpay.subscriber.charge(subscriberID, data, options)
        .then(res => console.log(res))
        .catch(err => console.log(err));

    /*  NOTICE 1: Another charge with the same Idempotency-Key
        will return the original charge response. It will NOT
        create a new charge. This is to prevent faulty charges. */
    await scanpay.subscriber.charge(subscriberID, data, options)
        .then(res => console.log(res))
        .catch(err => console.log(err));


    /*  NOTICE 2: Another charge with the same Idempotency-Key,
        but different data, will NOT create a new charge, nor will
        it change the original charge. */
    subscriberID += 1;
    data.items[0].total = '0.15 DKK';
    await scanpay.subscriber.charge(subscriberID, data, options)
        .then(res => console.log(res))
        .catch(err => console.log(err));


    /*  NOTICE 3: You have to generate a new Idempotency-Key, if
        we want to make a new charge. */
    options.idempotency = scanpay.generateIdempotencyKey()
    await scanpay.subscriber.charge(subscriberID, data, options)
        .then(res => console.log(res))
        .catch(err => console.log(err));

})();

