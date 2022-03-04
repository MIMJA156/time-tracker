const path = require("path");
const port = 3217
const express = require("express");
const fs = require("fs");
const {
    fileDir,
    fileName
} = require("./extension.js");

module.exports = () => {
    bootServer();
    return port;
};

function bootServer() {
    let app = express();

    app.use(express.static(path.join(__dirname, "../public/")));

    app.get('/api', (req, res) => {
        res.send('The server is up and running!');
    });

    app.get('/api/initial-data', (req, res) => {
        res.send("HALLO");
    });

    app.get('/api/update-data', (req, res) => {
        res.send("HALLO");
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