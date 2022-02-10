const vscode = require('vscode');
const fs = require('fs');

const global = {};
const cache = {};

global.minutesInADay = 1440;

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
    global.currentTime = getCurrentTime();

    //Get the current settings
    defineCurrentSettings();
    cache.labelPosition = global.labelPosition;
    cache.labelPriority = global.labelPriority;
    cache.iconString = global.iconString;

    vscode.workspace.onDidChangeConfiguration(() => {
        defineCurrentSettings();

        if (global.labelPosition !== cache.labelPosition || global.labelPriority !== cache.labelPriority) {
            vscode.window.showInformationMessage('Reload VSCode to see the changes.', 'Reload').then(selection => {
                if (selection == 'Reload') {
                    vscode.commands.executeCommand("workbench.action.reloadWindow");
                }
            });
        }

        if (global.iconString !== cache.iconString) {
            global.item.text = `${global.iconString}`;
        }

        cache.labelPosition = global.labelPosition;
        cache.labelPriority = global.labelPriority;
        cache.iconString = global.iconString;
    })

    // create the bar icon
    global.item = vscode.window.createStatusBarItem(global.labelPosition, global.labelPriority);
    global.item.command = 'mimjas-time-tracker.timeStatuesItemClicked';
    context.subscriptions.push(global.item);

    global.item.text = `${global.iconString}`;
    global.item.tooltip = `Time Spent Coding on ${`${global.currentTime[1]}/${global.currentTime[2]}/${global.currentTime[0]}`}`;
    global.item.show();

    // Initialize the time counting
    initializeTimeValues();
    initiateCounting();
}

function initializeTimeValues() {
    global.currentTime = getCurrentTime();
    let savedTimeJson;

    try {
        savedTimeJson = fs.readFileSync(`${__dirname}/../time-tracker-storage-mimja/time.json`, 'utf8');
    } catch (e) {
        fs.writeFileSync(`${__dirname}/../time-tracker-storage-mimja/time.json`, '{}');
        savedTimeJson = fs.readFileSync(`${__dirname}/../time-tracker-storage-mimja/time.json`, 'utf8');
    }

    if (!savedTimeJson[global.currentTime[0]]) {
        // code for when the year is not in the json file or the json file is empty.
    }
}


/**
 * @returns {object}
 */
function defineNewJson() {

}

function initiateCounting() {
    clearInterval(global.importantInterval);
    global.importantInterval = setInterval(() => {

    }, 1000)
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

/**
 * @returns {[year, month, day, hour, minute, sec]} An array of time values.
 */

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