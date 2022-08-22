const vscode = require('vscode');
const { badgeInit, badgeUpdate, updateBadgeAlignment, updateBadgeIcon, updateBadgeText, updateBadgeTooltip } = require('./tools/badge');
const { bootTimer, getTime, setCallback1s, setCallback30s, setCallback1m } = require('./tools/timer');

/**
 * Runs on the activation of the extension
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    badgeInit(context);

    let toggle = 0;
    setInterval(() => {
        toggle++;

        switch (toggle) {
            case 1:
                updateBadgeAlignment(vscode.StatusBarAlignment.Right);
                updateBadgeIcon("debug-breakpoint-data-disabled");
                updateBadgeText("Text 1");
                updateBadgeTooltip("Tooltip 1");
                break;

            case 2:
                updateBadgeAlignment(vscode.StatusBarAlignment.Left);
                updateBadgeIcon("debug-breakpoint-data-unverified");
                updateBadgeText("Text 2");
                updateBadgeTooltip("Tooltip 2");
                break;

            default:
                break;
        }

        if (toggle == 2) toggle = 0;
    }, 5000);
}

module.exports = {
    activate
}