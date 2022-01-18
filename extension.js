const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	const myCommandId = 'mimjas-time-tracker.timeStatuesItemClicked';
	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, async () => {}));

	// create a new status bar item and align it left.
	const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	item.command = myCommandId;
	context.subscriptions.push(item);

	item.text = `$(circuit-board)}`;
	item.tooltip = `Time Spent Coding on ${getNumberDate()}`;
	item.show();
}

// this method is called when your extension is deactivated.
function deactivate() {}

module.exports = {
	activate,
	deactivate
}

function getNumberDate() {
	const timeArray = getCurrentTime();
	return `${timeArray[1]}/${timeArray[2]}/${timeArray[0]}`;
}

function getCurrentTime() {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = today.getMonth() + 1;
	const dd = today.getDate();
	return [yyyy, mm, dd];
}