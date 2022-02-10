const vscode = require('vscode');
const fs = require('fs');

const global = {};

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
    global.currentTime = getCurrentTime();

    //Get the current settings
    defineCurrentSettings();
    vscode.workspace.onDidChangeConfiguration(() => {
        defineCurrentSettings();
        reloadCurrentItems();
    })

    // create the bar icon
    global.item = vscode.window.createStatusBarItem(global.labelPosition, global.labelPriority);
    global.item.command = 'mimjas-time-tracker.timeStatuesItemClicked';
    context.subscriptions.push(global.item);

    global.item.text = `${global.iconString}`;
    global.item.tooltip = `Time Spent Coding on ${`${global.currentTime[1]}/${global.currentTime[2]}/${global.currentTime[0]}`}`;
    global.item.show();
}

function reloadCurrentItems() {
    global.item.alignment = vscode.StatusBarAlignment.Left;
    global.item.text = `${global.iconString}`;
    global.item.tooltip = `Time Spent Coding on ${`${global.currentTime[1]}/${global.currentTime[2]}/${global.currentTime[0]}`}`;
}

function defineCurrentSettings() {
    global.iconString = vscode.workspace.getConfiguration().get('Icon Style');
    if (global.iconString == '') {
        global.iconString = '$(circuit-board)';
        vscode.workspace.getConfiguration().update('Icon Style', 'circuit-board', vscode.ConfigurationTarget.Global);
    }
    global.iconString = `$(${global.iconString})`;

    if (vscode.workspace.getConfiguration().get('Label Position') == 'Left') {
        global.labelPosition = vscode.StatusBarAlignment.Left;
    } else {
        global.labelPosition = vscode.StatusBarAlignment.Right;
    }

    if (vscode.workspace.getConfiguration().get('Label Priority')) {
        if (global.labelPosition == vscode.StatusBarAlignment.Right) {
            global.labelPriority = Infinity;
        } else {
            global.labelPriority = -Infinity;
        }
    } else {
        if (global.labelPosition == vscode.StatusBarAlignment.Right) {
            global.labelPriority = -Infinity;
        } else {
            global.labelPriority = Infinity;
        }
    }
}

function initiateTimeCounting() {
    clearInterval(global.importantInterval);
    global.importantInterval = setInterval(() => {

    }, 1000)
}

function getCurrentTime() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = today.getMonth() + 1;
    const dd = today.getDate();
    const hh = today.getHours();
    const min = today.getMinutes();
    const sec = today.getSeconds();
    return [yyyy, mm, dd, hh, min, sec];
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}