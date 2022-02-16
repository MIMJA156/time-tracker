const fs = require('fs');
const port = 3457;
const Express = require('express');

const global = {};

global.fileDir = "time-tracker-storage-mimja";
global.fileName = "time.mim";

function bootServer() {
    let app = Express();

    app.use(Express.static(`${__dirname}/public/`));

    app.listen(port);

    app.post('/', async (req, res) => {
        if (req.headers.type.toLowerCase() === "query") {
            if (req.headers.week !== undefined) {
                let today = new Date();
                let year = today.getFullYear();
                let month = today.getMonth() + 1;
                let day = today.getDate();

                const storedJson = JSON.parse(fs.readFileSync(`${__dirname}/../${global.fileDir}/${global.fileName}.json`, 'utf8'));

                const daysToNumbersKey = {
                    'sunday': 0,
                    'monday': 1,
                    'tuesday': 2,
                    'wednesday': 3,
                    'thursday': 4,
                    'friday': 5,
                    'saturday': 6
                }

                let currentDay = daysToNumbersKey[storedJson[year][month][day].day];

                let a = await loopTillValue(currentDay, 0, '<');
                // let b = await loopTillValue(currentDay, 6, '>');

                // if (day - a <= 0) {

                // }

                // if (day + b >= getDaysInMonth(month, year)) {

                // }

                let week = [];

                for (let i = 0; i <= 6; i++) {
                    week[week.length] = storedJson[year][month][day - a + i];
                }

                res.send(week);
            }
        }
    });

    return port;
}

function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
};

async function loopTillValue(val, till, sign) {
    let loops = 0;
    let depth = 7

    let internalLoop = (val, till, sign, loops, resolve, reject) => {
        if (loops > depth) reject('Too many loops');
        if (sign === '>') {
            if (val >= till) {
                resolve(loops);
            } else {
                loops++;
                val++;
                internalLoop(val, till, sign, loops, resolve, reject);
            }
        } else if (sign === '<') {
            if (val <= till) {
                resolve(loops);
            } else {
                loops++;
                val--;
                internalLoop(val, till, sign, loops, resolve, reject);
            }
        }
    }

    let isDone = new Promise((resolve, reject) => {
        internalLoop(val, till, sign, loops, resolve, reject);
    })

    return await isDone;
}

module.exports = bootServer;