/*
    help@scanpay.dk || irc.scanpay.dk:6697 || scanpay.dk/slack
*/
const apikey = '1153:YHZIUGQw6NkCIYa3mG6CWcgShnl13xuI7ODFUYuMy0j790Q6ThwBEjxfWFXwJZ0W';
const scanpay = require('../')(apikey);

const subscriberid = 5;
const options = {
    hostname: 'api.test.scanpay.dk',
    headers: {
        'Idempotency-Key': scanpay.generateIdempotencyKey(),
    }
};

const data = {
    orderid: 'a766409',
    items: [
        {
            name: 'Pink Floyd: The Dark Side Of The Moon',
            quantity: 2,
            price: '99.99 DKK',
            sku: 'fadf23'
        },
        {
            name: '巨人宏偉的帽子',
            quantity: 2,
            price: '420 DKK',
            sku: '124'
        }
    ],
    billing: {
        name: 'John Doe',
        company: 'The Shop A/S',
        email: 'john@doe.com',
        phone: '+4512345678',
        address: ['Langgade 23, 2. th'],
        city: 'Havneby',
        zip: '1234',
        country: 'DK',
        vatin: '35413308',
        gln: '7495563456235'
    },
    shipping: {
        name: 'Jan Dåh',
        email: 'jan@doh.com',
        phone: '+45 87654321',
        address: [
            'Langgade 23, 1. th',
            'C/O The Choppa'
        ],
        city: 'Haveby',
        zip: '1235',
        country: 'DK'
    }
};

async function docharge() {
    let res = null;
    let i = 0;
    for (i = 0; i < 3; i++) {
        await scanpay.charge(subscriberid, data, options).then(
            (r) => res = r
        ).catch(e => {
            if (e instanceof scanpay.IdempotentResponseError) {
                /* Regenerate idempotency key */
                options.headers['Idempotency-Key'] = scanpay.generateIdempotencyKey();
                console.log('Idempotent exception: ' + e);
            } else {
                console.log('Exception (not idempotent:' + e);
            }
        });
        if (res != null) { break; }
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
    }
    if (i == 3) {
        console.log('Attempted charging 3 times and failed');
        return;
    }
    console.log('Charge result: ' + JSON.stringify(res));
}
docharge();
