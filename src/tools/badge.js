const vscode = require('vscode');
const { getCurrentDate } = require('./date');

var badge = null;
var alignment = vscode.StatusBarAlignment.Left;
var priority = Infinity;
var icon = "$(circuit-board)";

/**
 * display's the badge on extension boot up
 * @param {vscode.ExtensionContext} context 
 */
function badgeInit(context) {
    badge = vscode.window.createStatusBarItem(alignment, priority);
    badge.command = 'mimjas-time-tracker.timeStatuesItemClicked';
    context.subscriptions.push(badge);
    badge.show();

    badge.tooltip = `${getCurrentDate()}`;
    badge.text = `${icon}`;
}

module.exports = {
    badgeInit
}