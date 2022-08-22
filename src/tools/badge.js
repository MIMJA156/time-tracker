const vscode = require('vscode');
const { getCurrentDate } = require('./date');

var badge = null;
var alignment = vscode.StatusBarAlignment.Left;
var priority = Infinity;
var icon = "$(circuit-board)";
var context = null;

/**
 * display's the badge on extension boot up.
 * @param {vscode.ExtensionContext} c
 */
function badgeInit(c) {
    context = c;
    newBadge();
}

/**
 * Sets and updates the badges alignment.
 * @param {vscode.StatusBarAlignment} newAlignment 
 */
function updateBadgeAlignment(newAlignment) {
    alignment = newAlignment;
    refreshBadge();
}

/**
 * Sets and updates the badges position.
 * The higher the number the more to the left the badge will be set.
 * @param {number} newPriority 
 */
function updateBadgePriority(newPriority) {
    priority = newPriority;
    refreshBadge();
}


/**
 * Sets and updates the badges icon.
 * List of all valid icons https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
 * @param {string} newIcon 
 */
function updateBadgeIcon(newIcon) {
    icon = `$(${newIcon})`;
    let text = badge.text;
    text.replace(/\$\(.+\)/, "");
    badge.text = `${icon} ${text}`;
}

/**
 * Sets and updates the badges text.
 * @param {string} newText 
 */
function updateBadgeText(newText) {
    let text = badge.text.replace(!/\$\(.+\)/, "");
    badge.text.replace(text, "");
    badge.text = `${icon} ${newText}`;
}

/**
 * Sets and updates the badges tooltip.
 * @param {string} newTip
 */
function updateBadgeTooltip(newTip) {
    badge.tooltip = newTip;
}

/**
 * Creates a new badge and replaces one if it already exists.
 */
function newBadge() {
    if (badge != null) badge.dispose();

    badge = vscode.window.createStatusBarItem(alignment, priority);
    badge.command = 'mimjas-time-tracker.timeStatuesItemClicked';
    context.subscriptions.push(badge);
    badge.show();

    badge.tooltip = `${getCurrentDate()}`;
    badge.text = `${icon}`;
}

/**
 * refreshes the current badges position/alignment.
 */
function refreshBadge() {
    let text = badge.text;

    badge.dispose();
    badge = vscode.window.createStatusBarItem(alignment, priority);
    badge.command = 'mimjas-time-tracker.timeStatuesItemClicked';
    context.subscriptions.push(badge);
    badge.show();

    badge.text = text;
}

module.exports = {
    badgeInit,
    updateBadgeAlignment,
    updateBadgePriority,
    updateBadgeIcon,
    updateBadgeText,
    updateBadgeTooltip
}