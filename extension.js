const vscode = require('vscode');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */

const global = {};

function activate(context) {
	resetIdleTimeout(300000);
	vscode.workspace.onDidChangeTextDocument(changeEvent => {
		let file_path = changeEvent.document.uri.path.split('.');
		global.current_file_type = file_path[file_path.length - 1];
		resetIdleTimeout(300000);
	});

	const myCommandId = 'mimjas-time-tracker.timeStatuesItemClicked';
	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, async () => {}));

	const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	item.command = myCommandId;
	context.subscriptions.push(item);

	try {
		global.full = JSON.parse(fs.readFileSync(`${__dirname}/../time-tracker-storage-mimja/time.json`));
	} catch (e) {
		fs.mkdirSync(`${__dirname}/../time-tracker-storage-mimja/`);
		fs.writeFileSync(`${__dirname}/../time-tracker-storage-mimja/time.json`, '{}');
		global.full = {};
	}

	const currentTime = getCurrentTime();
	try {
		if (global.full[currentTime[0]] == null) throw new Error('year');
		if (global.full[currentTime[0]].months[currentTime[1]][currentTime[2]].active == null) throw new Error('missing');
		if (global.full[currentTime[0]].months[currentTime[1]][currentTime[2]].idle == null) throw new Error('missing');
		if (global.full[currentTime[0]].months[currentTime[1]][currentTime[2]].graph == null) throw new Error('missing');
	} catch (e) {
		updateAllJson(e);
	}

	var hours = `${(global.full[currentTime[0]].months[currentTime[1]][currentTime[2]].active / 60)}`.split('.')[0];
	var minutes = (global.full[currentTime[0]].months[currentTime[1]][currentTime[2]].active - (hours * 60));

	item.text = `$(circuit-board) ${timeString(hours, minutes)}`;
	item.tooltip = `Time Spent Coding on ${getNumberDate()}`;
	item.show();

	let count = 0;
	setInterval(() => {
		count++;
		if (count >= 60 && global.idle != true) {
			count = 0;
			const currentTime = getCurrentTime();

			if (!global.full[currentTime[0]]) newYearOfTimeJson();

			hours = `${(global.full[currentTime[0]].months[currentTime[1]][currentTime[2]].active / 60)}`.split('.')[0];
			minutes = (global.full[currentTime[0]].months[currentTime[1]][currentTime[2]].active - (hours * 60));

			minutes++;
			if (minutes >= 60) {
				minutes = 0;
				hours++;
			}

			item.text = `$(circuit-board) ${timeString(hours, minutes)}`;
			item.tooltip = `Time Spent Coding on ${getNumberDate()}`;
			item.show();

			global.full[currentTime[0]].months[currentTime[1]][currentTime[2]].active++;
			fs.writeFileSync(`${__dirname}/../time-tracker-storage-mimja/time.json`, JSON.stringify(global.full, null, 4));
		} else if (global.idle == true) {
			count--;
		}
		console.log(count);
	}, 1000);
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
	const currentTime = getCurrentTime();

	const empty = {};
	const months = 12;
	const days = 31;
	const filler = {
		active: 0,
		idle: 0,
		graph: [],
	};

	empty[currentTime[0]] = {
		"months": {}
	};

	for (let i_1 = 1; i_1 < months + 1; i_1++) {
		empty[currentTime[0]].months[i_1] = {};
		for (let i_2 = 1; i_2 < days + 1; i_2++) {
			empty[currentTime[0]].months[i_1][i_2] = filler;
		}
	}

	global.full = Object.assign({}, global.full, empty);
	fs.writeFileSync(`${__dirname}/../time-tracker-storage-mimja/time.json`, JSON.stringify(global.full, null, 4));
}

function updateAllJson(error) {
	if (error.message == 'year') {
		newYearOfTimeJson();
	}
	if (error.message == 'missing') {
		let empty = {};
		for (const key_1 in global.full) {
			empty[key_1] = {
				"months": {}
			};
			for (const key_2 in global.full[key_1].months) {
				empty[key_1].months[key_2] = {};
				for (const key_3 in global.full[key_1].months[key_2]) {
					empty[key_1].months[key_2][key_3] = {
						active: (global.full[key_1].months[key_2][key_3].active == undefined) ? 0 : global.full[key_1].months[key_2][key_3].active,
						idle: (global.full[key_1].months[key_2][key_3].idle == undefined) ? 0 : global.full[key_1].months[key_2][key_3].idle,
						graph: (global.full[key_1].months[key_2][key_3].graph == undefined) ? [] : global.full[key_1].months[key_2][key_3].graph,
					};
				}
			}
		}

		global.full = Object.assign({}, empty);
		fs.writeFileSync(`${__dirname}/../time-tracker-storage-mimja/time.json`, JSON.stringify(global.full, null, 4));
	}
}

var timeout;

function resetIdleTimeout(time) {
	global.idle = false;
	clearTimeout(timeout);
	timeout = setTimeout(() => {
		global.idle = true;
		vscode.window.showInformationMessage('Idle mode has been activated. Time will not be logged until you resume coding.');
	}, time);
}