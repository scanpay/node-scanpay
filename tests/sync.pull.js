/*
    Scanpay Node.js client library (Node >= v6.6.0)
    Docs: https://docs.scanpay.dk/
    help@scanpay.dk || irc.libera.chat:6697 #scanpay
*/

const apikey = '1153:YHZIUGQw6NkCIYa3mG6CWcgShnl13xuI7ODFUYuMy0j790Q6ThwBEjxfWFXwJZ0W';
const scanpay = require('../')(apikey);

const options = {
    hostname: 'api.test.scanpay.dk',
    debug: true
};

// Second test: Apply changes since last seq call
let dbseq = 900; // Stored in the shop database after last seq.
async function applyChanges() {
    // Loop through all changes
    while (1) {
        let res;
        try {
            res = await scanpay.sync.pull(dbseq, options);
        } catch (e) {
            console.log(e);
            return;
        }
        // Apply some changes ... and update dbseq after
        for (const change of res.changes) {
            console.log(JSON.stringify(change, null, 4));
            switch (change.type) {
                case 'transaction':
                /* fallthrough */
                case 'charge':
                    console.log('order #' + change.orderid + ' updated to revision ' + change.rev);
                    break;
                case 'subscriber':
                    console.log('subscriber #' + change.ref + ' updated to revision ' + change.rev);
                    break;
            }
        }
        if (res.seq > dbseq) {
            console.log('Updating seq to ' + res.seq);
            dbseq = res.seq;
        }

        // Break when there are no more changes
        if (res.changes.length === 0) {
            console.log('Done applying changes, new seq is ' + dbseq);
            return;
        }
    }
}
applyChanges();

