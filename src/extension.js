const vscode = require('vscode');
const { badgeInit } = require('./tools/badge');
const { bootTimer, getTime, setCallback1s, setCallback30s, setCallback1m } = require('./tools/timer');

/**
 * Runs on the activation of the extension
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    bootTimer();
    badgeInit(context);
}

module.exports = {
    activate
}