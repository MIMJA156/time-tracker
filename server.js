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

    app.post('/', (req, res) => {
        if (req.headers.type.toLowerCase() === "query") {
            if (req.headers.week !== undefined) {
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth() + 1;
                const day = today.getDate();

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

                function loopTillValue(val, till, sign) {
                    let loops = 0;

                    let isDone = new Promise((resolve, reject) => {

                    })

                    let internalLoop = (val, till, sign, loops, resolve, reject) => {

                    }
                }
            }
        }
    });

    return port;
}

module.exports = bootServer;