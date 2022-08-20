const vscode = require('vscode');
const open = require('open');

const global = {};
const cache = {};

function activate() {
    setGlobal();
}

function setGlobal() {
    let storageTools = require('./tools/storage');
    let localJson = storageTools.getLocalStoredTime();
    let cloudJson = storageTools.getCloudStoredTime();

    console.log(localJson);
    console.log(cloudJson);
}

module.exports = {
    activate
}