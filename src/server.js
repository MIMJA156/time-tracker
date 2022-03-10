const path = require("path");
const port = 3217
const ex = require("express");
const fs = require("fs");
const {
    file
} = require('../config.json');

module.exports = () => {
    bootServer();
    return port;
};

function bootServer() {
    let app = ex();

    app.use(ex.static(path.join(__dirname, "../public/")));

    app.get('/api', (req, res) => {
        res.send('The server is up and running!');
    });

    app.get('/api/initial-data', async (req, res) => {
        const parsed = JSON.parse(fs.readFileSync(`${__dirname}/../../${file.dir}/${file.name}.json`, 'utf8'));

        let graphDataChanged = {
            current: "L"
        };

        let firstRecordedYear = parseFloat(Object.keys(parsed)[Object.keys(parsed).length - Object.keys(parsed).length]);
        let firstRecordedMonth = parseFloat(Object.keys(parsed[firstRecordedYear])[Object.keys(parsed[firstRecordedYear]).length - Object.keys(parsed[firstRecordedYear]).length]);
        let firstRecordedDay = parseFloat(Object.keys(parsed[firstRecordedYear][firstRecordedMonth])[Object.keys(parsed[firstRecordedYear][firstRecordedMonth]).length - Object.keys(parsed[firstRecordedYear][firstRecordedMonth]).length]);

        let currentRecordedYear = parseFloat(Object.keys(parsed)[Object.keys(parsed).length - 1]);
        let currentRecordedMonth = parseFloat(Object.keys(parsed[currentRecordedYear])[Object.keys(parsed[currentRecordedYear]).length - 1]);
        let currentRecordedDay = parseFloat(Object.keys(parsed[currentRecordedYear][currentRecordedMonth])[Object.keys(parsed[currentRecordedYear][currentRecordedMonth]).length - 1]);

        let currentDayIndex = new Date(`${currentRecordedYear}-${currentRecordedMonth}-${currentRecordedDay}`).getDay();

        console.log(`First year: ${firstRecordedYear}/${firstRecordedMonth}/${firstRecordedDay}`);
        console.log(`Current Date: ${currentRecordedYear}/${currentRecordedMonth}/${currentRecordedDay}`);

        let tillValues = [currentRecordedDay - await loopTillValue(currentDayIndex, 0, '<'), currentRecordedDay + await loopTillValue(currentDayIndex, 6, '>')];

        if (tillValues[0] < 1) {
            if (currentRecordedMonth - 1 < 1) currentRecordedMonth = 12;
            tillValues[0] = getDaysInMonth(currentRecordedMonth - 1, currentRecordedYear) + tillValues[0];
        }

        let currentWeek = [];

        let tillCurrentWeekEnd = await loopTillValue(currentDayIndex, 6, '>');
        let tillCurrentWeekStart = await loopTillValue(currentDayIndex, 0, '<');

        let firstCurrentDay = currentRecordedDay + tillCurrentWeekEnd;
        let secondCurrentDay = getDaysInMonth(currentRecordedMonth - 1, currentRecordedYear) + (currentRecordedDay - tillCurrentWeekStart);

        let lastWeek = [];

        res.send(graphDataChanged);
    });

    app.get('/api/update-data', (req, res) => {
        res.send("HALLOO");
    });

    app.listen(port, () => {
        return port;
    });
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
    let depth = 10;

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