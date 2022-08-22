const fs = require('fs');
const { dirname } = require('path');
const { file } = require('../../config.json');
const git = require("./auth");

/**
 * Gets the locally stored time JSON.
 * @returns {JSON|null}
 */
function getLocalStoredTime() {
    let storageFile = null;

    try {
        storageFile = fs.readFileSync(`${__dirname}/../../${file.dir}/${file.name}.json`, 'utf8');
    } catch (e) {
        try {
            fs.mkdirSync(`${__dirname}/../../${file.dir}/`);
        } catch (e) { }

        fs.writeFileSync(`${__dirname}/../../${file.dir}/${file.name}.json`, '{}');
        storageFile = fs.readFileSync(`${__dirname}/../../${file.dir}/${file.name}.json`, 'utf8');
    }

    storageFile = JSON.parse(storageFile);

    return storageFile;
}

/**
 * Sets the locally stored time JSON.
 * 
 * WARNING: This will overwrite all existing data in the file.
 * @param {JSON} newJson The new value of the JSON file.
 */
function setLocalStoredTime(newJson) {
    fs.writeFileSync(`${dirname}/../../${file.dir}/`, newJson);
}

/**
 * Gets the cloud stored time JSON.
 * @returns {JSON|null}
 */
function getCloudStoredTime() {
    git.getData();
    return null;
}

/**
 * Set the cloud stored time JSON.
 * 
 * WARNING: This will overwrite all existing data in the file.
 * @param {JSON} newJson The new value of the JSON file.
 */
function setCloudStoredTime(newJson) {

}

module.exports = {
    getLocalStoredTime,
    setLocalStoredTime,
    getCloudStoredTime,
    setCloudStoredTime
}