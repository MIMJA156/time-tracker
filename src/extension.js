const vscode = require('vscode');
const fs = require('fs');
const open = require('open');

const {
    file
} = require('../config.json');

const global = {};
const cache = {};

function activate() {
    setGlobal();
}

function deactivate() {

}

function getLocalStoredTime() {

}

function getCloudStoredTime() {

}

module.exports = {
    activate,
    deactivate
}