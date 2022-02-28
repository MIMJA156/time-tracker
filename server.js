const fs = require('fs');
const port = 3457;
const Express = require('express');

const global = {};

global.fileDir = "time-tracker-storage-mimja";
global.fileName = "time.mim";
global.active = false;
global.idleTimeout = null;
global.server;

function bootServer() {
    if (global.active) return port;
    global.active = true;

    let app = Express();

    app.use(Express.static(`${__dirname}/public/`));

    global.server = app.listen(port);

    app.get('/api/ping', async (req, res) => {
        clearTimeout(global.idleTimeout);
        global.idleTimeout = setTimeout(() => {
            global.server.close(() => {
                global.active = false;
            });
        }, 1000 * 60);
        res.send('pong');
    });

    app.post('/api/update', async (req, res) => {

    });

    app.post('/api/get-data', async (req, res) => {
        const unParsed = fs.readFileSync(`${__dirname}/../${global.fileDir}/${global.fileName}.json`, 'utf8');
        const parsed = JSON.parse(unParsed);

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        let graphDataChanged = {};

        let firstYear = parseFloat(Object.keys(parsed)[Object.keys(parsed).length - Object.keys(parsed).length]);
        let firstMonth = parseFloat(Object.keys(parsed[firstYear])[Object.keys(parsed[firstYear]).length - Object.keys(parsed[firstYear]).length]);
        let firstDay = parseFloat(Object.keys(parsed[firstYear][firstMonth])[Object.keys(parsed[firstYear][firstMonth]).length - Object.keys(parsed[firstYear][firstMonth]).length]);

        let lastYear = parseFloat(Object.keys(parsed)[Object.keys(parsed).length - 1]);
        let lastMonth = parseFloat(Object.keys(parsed[lastYear])[Object.keys(parsed[lastYear]).length - 1]);
        let lastDay = parseFloat(Object.keys(parsed[lastYear][lastMonth])[Object.keys(parsed[lastYear][lastMonth]).length - 1]);

        var dayKey = {
            'sunday': 0,
            'monday': 1,
            'tuesday': 2,
            'wednesday': 3,
            'thursday': 4,
            'friday': 5,
            'saturday': 6
        };

        let fromBeginning = await loopTillValue(today.getDay(), 0, '<');

        let currentDay = day;
        let currentMonth = month;
        let currentYear = year;

        currentDay -= fromBeginning;
        if (currentDay < 1) {
            currentMonth--;
            if (currentMonth < 1) {
                currentYear--;
                currentMonth = 12;
            }
            currentDay = getDaysInMonth(currentMonth, currentYear);
        }

        let currentDay_2 = currentDay;
        let currentMonth_2 = currentMonth;
        let currentYear_2 = currentYear;

        currentDay_2 += 6;
        if (currentDay_2 > getDaysInMonth(currentMonth_2, currentYear_2)) {
            currentMonth_2++;
            if (currentMonth_2 > 12) {
                currentYear_2++;
                currentMonth_2 = 1;
            }
            currentDay_2 = 1;
        }

        graphDataChanged.current = `${currentYear}-${currentMonth}-${currentDay}/${currentYear_2}-${currentMonth_2}-${currentDay_2}`;

        if (parsed[firstYear][firstMonth][firstDay].day != 'sunday') {
            let loop = await loopTillValue(dayKey[parsed[firstYear][firstMonth][firstDay].day], 0, '<');
            firstDay -= loop;

            if (firstDay < 1) {
                firstMonth--;
                if (firstMonth < 1) {
                    firstYear--;
                    firstMonth = 12;
                }

                firstDay = getDaysInMonth(firstMonth, firstYear);
            }
        }

        if (parsed[lastYear][lastMonth][lastDay].day != 'saturday') {
            let loop = await loopTillValue(dayKey[parsed[lastYear][lastMonth][lastDay].day], 6, '>');
            lastDay += loop;

            if (lastDay > getDaysInMonth(lastMonth, lastYear)) {
                lastMonth++;
                if (lastMonth > 12) {
                    lastYear++;
                    lastMonth = 1;
                }

                lastDay = 1;
            }
        }

        let getActiveArray = () => {
            let activeArray = [];
            let z = firstYear;
            let y = firstMonth;
            let x = firstDay;

            for (let i = 0; i < 7; i++) {
                if (x > getDaysInMonth(firstMonth, firstYear)) {
                    y += 1;
                    if (y > 12) {
                        z += 1;
                        y = 1;
                    }
                    x = 1;
                }

                try {
                    activeArray[i] = parsed[z][y][x]['active'];
                } catch (e) {
                    activeArray[i] = 0;
                }

                x++;
            }

            return activeArray;
        }

        let loopThroughAndSetData = (depth) => {
            depth = depth ? depth : 0;

            let a = firstDay + 6;
            let b = firstMonth;
            let c = firstYear;

            if (a > getDaysInMonth(firstMonth, firstYear)) {
                b += 1;

                if (b > 12) {
                    c += 1;
                    b = 1;
                }

                a = 1;
            }

            graphDataChanged[`${firstYear}-${firstMonth}-${firstDay}/${c}-${b}-${a}`] = {
                active: getActiveArray()
            };

            firstDay = a + 1;
            firstMonth = b;
            firstYear = c;

            if (`${c}-${b}-${a}` === `${lastYear}-${lastMonth}-${lastDay}`) return;

            loopThroughAndSetData(depth + 1);
        }

        loopThroughAndSetData();

        res.send(graphDataChanged);
    });

    return port;
}


//Useful functions.

/**
 * @param {number} month 
 * @param {number} year 
 * @returns {number} The number of days in the month specified.
 */
function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
};

/**
 * @param {number} val The number you want to check
 * @param {number} till The number you want to loop to
 * @param {string} sign Use `<` or `>`
 * @returns The number of times it took to reach `till` from `val`
 */
async function loopTillValue(val, till, sign) {
    let loops = 0;
    let depth = 7;

    let internalLoop = (val, till, sign, loops, resolve, reject) => {
        if (loops > depth) reject('Too many loops.');
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