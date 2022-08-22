const fs = require('fs');
const { file } = require('../../config.json');
const git = require("./auth");

/**
 * Gets the locally stored time JSON.
 * @returns {JSON}
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
 * Gets the cloud stored time JSON.
 * @returns {JSON}
 */
function getCloudStoredTime() {
    git.getData();
    return null;
}

module.exports = {
    getLocalStoredTime,
    getCloudStoredTime
}