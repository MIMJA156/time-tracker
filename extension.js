const vscode = require('vscode');
const fs = require('fs');
const open = require('open');
const bootServer = require('./server');

const global = {};
const cache = {};

global.json = {};
global.isIdle = false;
global.minutesInADay = 1440;
global.timeTillIdle = 5 * 60 * 1000;
global.fileDir = "time-tracker-storage-mimja";
global.fileName = "time.mim";
global.idleTimeout = null;

/**
 * This functions returns an array containing information about the current local time.
 * @returns {[year, month, day, hour, minute, sec, today]}
 */
global.currentTime = () => {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = today.getMonth() + 1;
	const dd = today.getDate();
	const hh = today.getHours();
	const min = today.getMinutes();
	const sec = today.getSeconds();
	return [yyyy, mm, dd, hh, min, sec, today];
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
			updateBarItem();
		}

		cache.labelPosition = global.labelPosition;
		cache.labelPriority = global.labelPriority;
		cache.iconString = global.iconString;
	})

	// create the bar icon
	global.item = vscode.window.createStatusBarItem(global.labelPosition, global.labelPriority);
	global.item.command = 'mimjas-time-tracker.timeStatuesItemClicked';
	context.subscriptions.push(global.item);
	global.item.show();

	//Listen for command input
	context.subscriptions.push(vscode.commands.registerCommand('mimjas-time-tracker.timeStatuesItemClicked', async () => {
		let port = bootServer();
		await open(`http://localhost:${port}`);
	}));

	// Initialize the time counting
	initializeTimeValues();
	updateBarItem();
	initiateCounting();
	unIdle(69);

	// Listen for un-idle events
	vscode.workspace.onDidChangeTextDocument(changeEvent => unIdle(changeEvent));
	vscode.workspace.onDidCreateFiles(createEvent => unIdle(createEvent));
	vscode.workspace.onDidDeleteFiles(deleteEvent => unIdle(deleteEvent));
	vscode.workspace.onDidRenameFiles(renameEvent => unIdle(renameEvent));
	vscode.window.onDidOpenTerminal(terminal => unIdle(terminal));
	vscode.window.onDidCloseTerminal(terminal => unIdle(terminal));
	vscode.window.onDidChangeWindowState(state => unIdle(state));
}

function updateBarItem() {
	let seconds = global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].active;

	let hours = `${(seconds / 60) / 60}`.split('.')[0];
	let minutes = `${((seconds / 60) - (hours * 60))}`.split('.')[0];

	let h_s = `${hours} hr`;
	let m_s = `${minutes} min`;

	if (hours <= 0) h_s = '';
	if (minutes <= 0) m_s = '';
	if (hours > 1) h_s = `${h_s}s`;
	if (minutes > 1) m_s = `${m_s}s`;

	global.item.text = `${global.iconString} ${h_s} ${m_s}`;
	global.item.tooltip = `Time Spent Coding on ${`${global.currentTime()[1]}/${global.currentTime()[2]}/${global.currentTime()[0]}`}`;
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
		if (global.isIdle) return;
		global.json = checkJson(global.json);
		global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].active++;
		if (global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].active % 60 == 0) {
			updateBarItem();
			fs.writeFileSync(`${__dirname}/../${global.fileDir}/${global.fileName}.json`, JSON.stringify(global.json));
		}
	}, 1000)
}

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

	if (previous.day == undefined) {
		let dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
		checkedJson[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].day = dayKey[global.currentTime()[6].getDay()];
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
	global.iconString = vscode.workspace.getConfiguration().get('mimjas-time-tracker.iconStyle');
	if (global.iconString == '') {
		global.iconString = 'circuit-board';
		vscode.workspace.getConfiguration().update('mimjas-time-tracker.iconStyle', 'circuit-board', vscode.ConfigurationTarget.Global);
	}

	global.iconString = `$(${global.iconString})`;

	if (vscode.workspace.getConfiguration().get('mimjas-time-tracker.labelPosition') == 'Left') {
		global.labelPosition = vscode.StatusBarAlignment.Left;
	} else {
		global.labelPosition = vscode.StatusBarAlignment.Right;
	}

	if (vscode.workspace.getConfiguration().get('mimjas-time-tracker.labelPriority')) {
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

function unIdle(event) {
	if (global.isIdle) global.isIdle = false;
	if (!event.focused) return;

	clearTimeout(global.idleTimeout);
	global.idleTimeout = setTimeout(() => {
		global.isIdle = true;
		vscode.window.showInformationMessage('Idle mode has been activated. Time will not be logged until you resume coding.');
	}, global.timeTillIdle);
}

/**
 * @param {string} filepath 
 * @returns file type
 */
function parse(filepath) {
	return filepath.substring(filepath.lastIndexOf('.') + 1, filepath.length);
}

function deactivate() {
	fs.writeFileSync(`${__dirname}/../${global.fileDir}/${global.fileName}.json`, JSON.stringify(global.json));
}

module.exports = {
	activate,
	deactivate
}