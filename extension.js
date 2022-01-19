const vscode = require('vscode');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */

const global = {};

function activate(context) {
	const myCommandId = 'mimjas-time-tracker.timeStatuesItemClicked';
	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, async () => {}));

	// create a new status bar item and align it to the left.
	const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	item.command = myCommandId;
	context.subscriptions.push(item);

	try {
		global.full = fs.readFileSync(`${__dirname}/../time-tracker-storage-mimja/time.json`);
	} catch (e) {
		fs.mkdirSync(`${__dirname}/../time-tracker-storage-mimja/`);
		fs.writeFileSync(`${__dirname}/../time-tracker-storage-mimja/time.json`, '{}');
	}

	try {
		global.full[2022].months;
	} catch (e) {

	}

	item.text = `$(circuit-board) ${timeString(1, 0)}`;
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

function timeString(hours, minutes) {
	let h_s = `${hours} hr`;
	let m_s = `${minutes} min`;

	if (hours <= 0) h_s = '';
	if (minutes <= 0) m_s = '';
	if (hours > 1) h_s = `${h_s}s`;
	if (minutes > 1) m_s = `${m_s}s`;

	return `${h_s} ${m_s}`;
}

function newYearOfTimeJson() {

}