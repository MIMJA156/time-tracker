/**
 * This functions returns an array containing information about the current local time.
 * @returns {{year:Number, month:Number, day:Number, hour:Number, minute:Number, sec:Number, today:Date}}
 */
function getCurrentTimeValues() {
    const today = new Date();
    return {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
        hour: today.getHours(),
        minute: today.getMinutes(),
        second: today.getSeconds(),
        today: today
    };
}

/**
 * The current date in number format
 * @returns {String}
 */
function getCurrentDate() {
    const today = new Date();
    return `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
}

module.exports = {
    getCurrentTimeValues,
    getCurrentDate
}