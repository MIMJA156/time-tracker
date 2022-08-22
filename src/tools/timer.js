const timeToIncreaseBy = 1000; // in milliseconds

var interval = null;
var time = 0;

var callback1m = () => { };
var callback30s = () => { };
var callback1s = () => { };

/**
 * Boots the main timer loop.
 */
function startTimer() {
    interval = setInterval(() => {
        time += timeToIncreaseBy;

        if (time % (60 * 1000) == 0) callback1m(time);
        if (time % (30 * 1000) == 0) callback30s(time);
        callback1s(time);
    }, timeToIncreaseBy);
}

/**
 * Stops the timer loop.
 */
function stopTimer() {
    clearInterval(interval);
}

/**
 * Set's a function to be run every 1m of the timer.
 * @param {Function} cb function that's run.
 */
function setCallback1m(cb) {
    callback1m = cb;
}

/**
 * Set's a function to be run every 30s of the timer.
 * @param {Function} cb function that's run.
 */
function setCallback30s(cb) {
    callback30s = cb;
}

/**
 * Set's a function to be run every 1s of the timer.
 * @param {Function} cb function that's run.
 */
function setCallback1s(cb) {
    callback1s = cb;
}

/**
 * Returns the currently cached time.
 * @returns {Number} time in milliseconds.
 */
function getTime() {
    return time;
}

module.exports = {
    startTimer,
    stopTimer,
    getTime,
    setCallback1m,
    setCallback30s,
    setCallback1s
}