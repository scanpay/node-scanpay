/*
    help@scanpay.dk || irc.scanpay.dk:6697 || scanpay.dk/slack
*/
const apikey = '65:kbzU74IUyXO3zeRauOX/YusRSuH5WNFvoVYFYAi4J8TA5hOOjxrgsSxdTylXQ2pa';
const scanpay = require('../')(apikey);

const options = {
    hostname: 'api.test.scanpay.dk'
};

// Get the maximum seq
scanpay.seq(null, options).then(res => {
    console.log('Max seq: ' + JSON.stringify(res));
}).catch(e => console.log(e));

let dbseq = 6231; // Stored in the shop database.

// Loop through all changes
function applyChanges(seq) {
    scanpay.seq(seq, options).then(res => {
        for (let i of res.changes) {
            console.log(JSON.stringify(i, null, 4));
            // Apply some changes ... and update dbseq.
            dbseq = i.id;
        }

        if (res.changes.length > 0) {
            return applyChanges(dbseq);
        }
    }).catch(e => console.log(e));
}
applyChanges(dbseq);

