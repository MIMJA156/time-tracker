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

        console.log(`First year: ${firstRecordedYear}/${firstRecordedMonth}/${firstRecordedDay}`);
        console.log(`Current Date: ${currentRecordedYear}/${currentRecordedMonth}/${currentRecordedDay}`);

        let currentWeek = await dateToWeek(currentRecordedDay, currentRecordedMonth, currentRecordedYear);
        let firstWeek = await dateToWeek(firstRecordedDay, firstRecordedMonth, firstRecordedYear);

        graphDataChanged.current = `${currentWeek[0]}-${currentWeek[1]}-${currentWeek[2]}/${currentWeek[3]}-${currentWeek[4]}-${currentWeek[5]}`;

        let firstDate = new Date(`${firstWeek[3]}/${firstWeek[4]}/${firstWeek[5]}`);
        let currentDate = new Date(`${currentWeek[0]}/${currentWeek[1]}/${currentWeek[2]}`);
        let DifferenceInTime = currentDate.getTime() - firstDate.getTime();
        let DifferenceInDays = Math.ceil(DifferenceInTime / (1000 * 3600 * 24) + 1);

        let array = [];
        let temp = [...currentWeek];
        for (let i = 1; i < DifferenceInDays; i++) {
            try {
                array.push(parsed[temp[0]][temp[1]][temp[2]].active);
            } catch (e) {
                array.push(0);
            }

            temp[2] -= 1;
            if (temp[2] < 1) {
                temp[1] -= 1;
                temp[2] = getDaysInMonth(temp[1], temp[0]);
            }

            if (i / 7 === Math.floor(i / 7)) {
                graphDataChanged[`${currentWeek[0]}-${currentWeek[1]}-${currentWeek[2]}/${currentWeek[3]}-${currentWeek[4]}-${currentWeek[5]}`] = {};
                graphDataChanged[`${currentWeek[0]}-${currentWeek[1]}-${currentWeek[2]}/${currentWeek[3]}-${currentWeek[4]}-${currentWeek[5]}`].active = array;
                array = [];

                currentWeek[2] -= 7;
                if (currentWeek[2] < 1) {
                    currentWeek[1]--;
                    currentWeek[2] = getDaysInMonth(currentWeek[1], currentWeek[0]) + currentWeek[2];
                }

                currentWeek[5] -= 7;
                if (currentWeek[5] < 1) {
                    currentWeek[4]--;
                    currentWeek[5] = getDaysInMonth(currentWeek[4], currentWeek[3]) + currentWeek[5];
                }
            }
        }

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

/**
 * This will let you know what week a certain date is in.
 * @param {number} day 
 * @param {number} month 
 * @param {number} year 
 * @returns {array} all the dates for the two dates that make up the week.
 */
async function dateToWeek(day, month, year) {
    let dayIndex = new Date(`${year}/${month}/${day}`).getDay();

    let tillWeekEnd = await loopTillValue(dayIndex, 6, '>');
    let tillWeekStart = await loopTillValue(dayIndex, 0, '<');

    let firstDay = day + tillWeekEnd;
    let secondDay = day - tillWeekStart;

    let firstMonth = month;
    let secondMonth = month;

    let firstYear = year;
    let secondYear = year;

    if (firstDay > getDaysInMonth(firstMonth, firstYear)) {
        firstMonth = month + 1;
        if (firstMonth > 12) {
            firstMonth = 1;
            firstYear += 1;
        }
        firstDay = firstDay - getDaysInMonth(firstMonth - 1, firstYear);
    }

    if (secondDay < 1) {
        secondMonth -= 1;
        if (secondMonth < 1) {
            secondMonth = 12;
            secondYear -= 1;
        }
        secondDay = getDaysInMonth(secondMonth, secondYear) + secondDay;
    }

    return [firstYear, firstMonth, firstDay, secondYear, secondMonth, secondDay];
}