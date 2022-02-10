const vscode = require('vscode');
const fs = require('fs');

const global = {};
const cache = {};

let count = 0;
var a = false;

global.minutesInADay = 1440;
global.timeTillIdle = 5 * 60 * 1000;
global.json = {};

global.fileDir = "time-tracker-storage-mimja";
global.fileName = "storage.mim";

/**
 * This functions returns an array containing information about the current local time.
 * @returns {[year, month, day, hour, minute, sec]}
 */
global.currentTime = () => {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = today.getMonth() + 1;
	const dd = today.getDate();
	const hh = today.getHours();
	const min = today.getMinutes();
	const sec = today.getSeconds();


	//MARK: This is a hack to fix the time.
	var newHours = hh;
	var newMinutes = min;
	let newDays = dd;
	let enabled = false;

	if (enabled) {
		if (sec !== 0) {
			newHours = hh + (24 - hh) - 1;
			newMinutes = min + (60 - min) - 1;
			a = true;
		} else if (sec === 0 && a) {
			newHours = 24;
			newMinutes = 0;
			count++;
			a = false;
		}
	}

	// newDays = dd + count;
	/*ending hack*/

	return [yyyy, mm, newDays, newHours, newMinutes, sec];
}

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
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
	global.item.tooltip = `Time Spent Coding on ${`${global.currentTime()[1]}/${global.currentTime()[2]}/${global.currentTime()[0]}`}`;
	global.item.show();

	// Initialize the time counting
	initializeTimeValues();
	initiateCounting();
}

/**
 * This function gets the currently saved information and passes it into `global.time`
 */
function initializeTimeValues() {
	let savedTimeJson;

	try {
		savedTimeJson = fs.readFileSync(`${__dirname}/../${global.fileDir}/${global.fileName}.json`, 'utf8');
	} catch (e) {
		try {
			fs.mkdirSync(`${__dirname}/../${global.fileDir}/`);
		} catch (e) {};
		fs.writeFileSync(`${__dirname}/../${global.fileDir}/${global.fileName}.json`, '{}');
		savedTimeJson = fs.readFileSync(`${__dirname}/../${global.fileDir}/${global.fileName}.json`, 'utf8');
	}

	global.json = checkJson(savedTimeJson);
}

/**
 * This function begins the counting process and begins logging active coding time.
 */
function initiateCounting() {
	clearInterval(global.importantInterval);
	global.importantInterval = setInterval(() => {
		global.json = checkJson(global.json);
		global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].active++;
		if (global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].active % 60 == 0) {
			fs.writeFileSync(`${__dirname}/../${global.fileDir}/${global.fileName}.json`, JSON.stringify(global.json));
		}
	}, 1000)
}

const key = {};
/**
 * This function runs a series of checks on the current json and fixes any thing it finds.
 */
function checkJson(json) {
	if (typeof json == 'string') json = JSON.parse(json);

	let hasChanged = false;
	let checkedJson = json;
	let previous = null;

	if (json[global.currentTime()[0]] == undefined) {
		checkedJson[global.currentTime()[0]] = {};
		hasChanged = true;
	}

	previous = json[global.currentTime()[0]];

	if (previous[global.currentTime()[1]] == undefined) {
		checkedJson[global.currentTime()[0]][global.currentTime()[1]] = {};
		hasChanged = true;
	}

	previous = json[global.currentTime()[0]][global.currentTime()[1]];

	if (previous[global.currentTime()[2]] == undefined) {
		checkedJson[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]] = {};
		hasChanged = true;
	}

	previous = json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]];

	if (previous.active == undefined) {
		checkedJson[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].active = 0;
		hasChanged = true;
	}

	if (hasChanged) {
		fs.writeFileSync(`${__dirname}/../${global.fileDir}/${global.fileName}.json`, JSON.stringify(checkedJson), null, 4);
	}

	return checkedJson;
}

/**
 * This function updates all the global variables to the current settings.
 */
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

function deactivate() {}

module.exports = {
	activate,
	deactivate
}