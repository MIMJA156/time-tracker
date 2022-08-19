const vscode = require('vscode');
const fs = require('fs');
const open = require('open');
const bootServer = require('./server');
const {
	file
} = require('../config.json');

const global = {};
const cache = {};

global.json = {};
global.isIdle = false;
global.minutesInADay = 1440;
global.timeTillIdle = 5 * 60 * 1000;
global.idleTimeout = null;
global.item = null;
global.currentLanguage = 'null';

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
		unIdle();

		if (global.labelPosition !== cache.labelPosition || global.labelPriority !== cache.labelPriority) {
			initiateCountingBadge(context);
			updateBarItem();
		}

		if (global.iconString !== cache.iconString) {
			updateBarItem();
		}

		cache.labelPosition = global.labelPosition;
		cache.labelPriority = global.labelPriority;
		cache.iconString = global.iconString;
	})

	// create the bar icon
	initiateCountingBadge(context);

	//Listen for click on the time logger item in the status bar
	context.subscriptions.push(vscode.commands.registerCommand('mimjas-time-tracker.timeStatuesItemClicked', showOnWeb));

	// Initialize the time counting
	initializeTimeValues();
	updateBarItem();
	initiateCounting();
	unIdle();

	// Listen for un-idle events
	vscode.workspace.onDidOpenTextDocument(openEvent => unIdle(openEvent));
	vscode.workspace.onDidCloseTextDocument(closeEvent => unIdle(closeEvent));
	vscode.workspace.onDidChangeTextDocument(changeEvent => unIdle(changeEvent));
	vscode.workspace.onDidCreateFiles(createEvent => unIdle(createEvent));
	vscode.workspace.onDidDeleteFiles(deleteEvent => unIdle(deleteEvent));
	vscode.workspace.onDidRenameFiles(renameEvent => unIdle(renameEvent));

	vscode.window.onDidOpenTerminal(terminal => unIdle(terminal));
	vscode.window.onDidCloseTerminal(terminal => unIdle(terminal));
	vscode.window.onDidChangeWindowState(state => unIdle(state));

	//Create any random commands.
	const showCatCommand = 'mimjas-time-tracker.showCat';
	const showGraphCommand = 'mimjas-time-tracker.showOnWeb';

	context.subscriptions.push(vscode.commands.registerCommand(showCatCommand, showCat));
	context.subscriptions.push(vscode.commands.registerCommand(showGraphCommand, showOnWeb))

	//Run checks on the web settings.
	checkWebSettings();
}

async function showOnWeb() {
	if (!global.isIdle) {
		let port = bootServer();
		await open(`http://localhost:${port}`);
		// vscode.window.showErrorMessage('This feature has been temporarily disabled due to a bug.');
	} else {
		vscode.window.showInformationMessage('Idle mode is currently active. If this idle timer is too short, you can change it in the settings.', 'Change Settings').then((s) => {
			if (s == 'Change Settings') {
				vscode.commands.executeCommand('workbench.action.openSettings', 'mimjas-time-tracker');
			}
		});
	}
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
		savedTimeJson = fs.readFileSync(`${__dirname}/../../${file.dir}/${file.name}.json`, 'utf8');
	} catch (e) {
		try {
			fs.mkdirSync(`${__dirname}/../../${file.dir}/`);
		} catch (e) {};
		fs.writeFileSync(`${__dirname}/../../${file.dir}/${file.name}.json`, '{}');
		savedTimeJson = fs.readFileSync(`${__dirname}/../../${file.dir}/${file.name}.json`, 'utf8');
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

		if (global.currentLanguage !== 'null') {
			if (global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].languages[global.currentLanguage] == undefined) {
				global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].languages[global.currentLanguage] = 0;
			} else {
				global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].languages[global.currentLanguage]++;
			}
		}

		updateBarItem();
		if (global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].active % 60 == 0) {
			fs.writeFileSync(`${__dirname}/../../${file.dir}/${file.name}.json`, JSON.stringify(global.json));
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

	if (previous.languages == undefined) {
		checkedJson[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].languages = {};
		hasChanged = true;
	}

	if (hasChanged) {
		fs.writeFileSync(`${__dirname}/../../${file.dir}/${file.name}.json`, JSON.stringify(checkedJson), null, 4);
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

	if (vscode.workspace.getConfiguration().get('mimjas-time-tracker.timeTillIdle') >= 1 || vscode.workspace.getConfiguration().get('mimjas-time-tracker.timeTillIdle') <= 60) {
		global.timeTillIdle = vscode.workspace.getConfiguration().get('mimjas-time-tracker.timeTillIdle') * 60 * 1000;
	}
}

/**
 * This function that handles the idle timer.
 */
function unIdle(event) {
	try {
		global.currentLanguage = event.document.languageId;
	} catch (e) {
		global.currentLanguage = 'null';
	}

	if (global.isIdle) {
		global.isIdle = false;
		updateBarItem();
	}

	clearTimeout(global.idleTimeout);
	global.idleTimeout = setTimeout(() => {
		global.isIdle = true;

		vscode.window.showInformationMessage('Idle mode has been activated. If this idle timer is too short, you can change it in the settings.', 'Change Settings').then((s) => {
			if (s == 'Change Settings') {
				vscode.commands.executeCommand('workbench.action.openSettings', 'mimjas-time-tracker');
			}
		});

		global.item.text = `${global.iconString} Idle`;
	}, global.timeTillIdle);
}

/**
 * @param {string} filepath 
 * @returns {string} file type
 */
function parse(filepath) {
	return filepath.substring(filepath.lastIndexOf('.') + 1, filepath.length);
}

/**
 * Displays a Cat Image in new Tab, very important.
 */
function showCat() {
	const panel = vscode.window.createWebviewPanel('catCoding', 'Cat Coding', vscode.ViewColumn.One, {});
	panel.webview.html = `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Cat Coding - Image</title>
	</head>
	<body>
		<img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="800" />
	</body>
	</html>`;
}

/**
 * This will remove the current counting badge and re-make it.
 * Basically updating the item.
 * @param {context} context 
 */
function initiateCountingBadge(context) {
	if (global.item != null) global.item.dispose();
	global.item = vscode.window.createStatusBarItem(global.labelPosition, global.labelPriority);
	global.item.command = 'mimjas-time-tracker.timeStatuesItemClicked';
	context.subscriptions.push(global.item);
	global.item.show();
}

function deactivate() {
	fs.writeFileSync(`${__dirname}/../../${file.dir}/${file.name}.json`, JSON.stringify(global.json));
}

/**
 * This function will check if the settings exist and if not, it will create them.
 */
function checkWebSettings() {
	if (!fs.existsSync(`${__dirname}/../../${file.dir}/settings.json`)) {
		fs.writeFileSync(`${__dirname}/../../${file.dir}/settings.json`, JSON.stringify({
			"web": {
				"font": "none",
				"graph": {
					"type": "bar",
					"colors": [
						'#FF6384',
						'#FF9F40',
						'#FFCD56',
						'#4BC0C0',
						'#36A2EB',
						'#9966FF',
						'#C9CBCF'
					]
				}
			}
		}));
	}

	let currentWebSettings = JSON.parse(fs.readFileSync(`${__dirname}/../../${file.dir}/settings.json`, 'utf-8'));

	if (!currentWebSettings.web.graph.type) {
		currentWebSettings.web.graph.type = 'bar';
	}

	if (!currentWebSettings.web.graph.colors) {
		currentWebSettings.web.graph.colors = [
			'#FF6384',
			'#FF9F40',
			'#FFCD56',
			'#4BC0C0',
			'#36A2EB',
			'#9966FF',
			'#C9CBCF'
		];
	}

	if (!currentWebSettings.web.font) {
		currentWebSettings.web.font = 'none';
	}

	fs.writeFileSync(`${__dirname}/../../${file.dir}/settings.json`, JSON.stringify(currentWebSettings));
}

module.exports = {
	activate,
	deactivate
}