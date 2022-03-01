var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/is-docker/index.js
var require_is_docker = __commonJS({
  "node_modules/is-docker/index.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var isDocker;
    function hasDockerEnv() {
      try {
        fs2.statSync("/.dockerenv");
        return true;
      } catch (_) {
        return false;
      }
    }
    function hasDockerCGroup() {
      try {
        return fs2.readFileSync("/proc/self/cgroup", "utf8").includes("docker");
      } catch (_) {
        return false;
      }
    }
    module2.exports = () => {
      if (isDocker === void 0) {
        isDocker = hasDockerEnv() || hasDockerCGroup();
      }
      return isDocker;
    };
  }
});

// node_modules/is-wsl/index.js
var require_is_wsl = __commonJS({
  "node_modules/is-wsl/index.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var fs2 = require("fs");
    var isDocker = require_is_docker();
    var isWsl = () => {
      if (process.platform !== "linux") {
        return false;
      }
      if (os.release().toLowerCase().includes("microsoft")) {
        if (isDocker()) {
          return false;
        }
        return true;
      }
      try {
        return fs2.readFileSync("/proc/version", "utf8").toLowerCase().includes("microsoft") ? !isDocker() : false;
      } catch (_) {
        return false;
      }
    };
    if (process.env.__IS_WSL_TEST__) {
      module2.exports = isWsl;
    } else {
      module2.exports = isWsl();
    }
  }
});

// node_modules/define-lazy-prop/index.js
var require_define_lazy_prop = __commonJS({
  "node_modules/define-lazy-prop/index.js"(exports2, module2) {
    "use strict";
    module2.exports = (object, propertyName, fn) => {
      const define = (value) => Object.defineProperty(object, propertyName, { value, enumerable: true, writable: true });
      Object.defineProperty(object, propertyName, {
        configurable: true,
        enumerable: true,
        get() {
          const result = fn();
          define(result);
          return result;
        },
        set(value) {
          define(value);
        }
      });
      return object;
    };
  }
});

// node_modules/open/index.js
var require_open = __commonJS({
  "node_modules/open/index.js"(exports2, module2) {
    var path = require("path");
    var childProcess = require("child_process");
    var { promises: fs2, constants: fsConstants } = require("fs");
    var isWsl = require_is_wsl();
    var isDocker = require_is_docker();
    var defineLazyProperty = require_define_lazy_prop();
    var localXdgOpenPath = path.join(__dirname, "xdg-open");
    var { platform, arch } = process;
    var getWslDrivesMountPoint = (() => {
      const defaultMountPoint = "/mnt/";
      let mountPoint;
      return async function() {
        if (mountPoint) {
          return mountPoint;
        }
        const configFilePath = "/etc/wsl.conf";
        let isConfigFileExists = false;
        try {
          await fs2.access(configFilePath, fsConstants.F_OK);
          isConfigFileExists = true;
        } catch {
        }
        if (!isConfigFileExists) {
          return defaultMountPoint;
        }
        const configContent = await fs2.readFile(configFilePath, { encoding: "utf8" });
        const configMountPoint = /(?<!#.*)root\s*=\s*(?<mountPoint>.*)/g.exec(configContent);
        if (!configMountPoint) {
          return defaultMountPoint;
        }
        mountPoint = configMountPoint.groups.mountPoint.trim();
        mountPoint = mountPoint.endsWith("/") ? mountPoint : `${mountPoint}/`;
        return mountPoint;
      };
    })();
    var pTryEach = async (array, mapper) => {
      let latestError;
      for (const item of array) {
        try {
          return await mapper(item);
        } catch (error) {
          latestError = error;
        }
      }
      throw latestError;
    };
    var baseOpen = async (options) => {
      options = {
        wait: false,
        background: false,
        newInstance: false,
        allowNonzeroExitCode: false,
        ...options
      };
      if (Array.isArray(options.app)) {
        return pTryEach(options.app, (singleApp) => baseOpen({
          ...options,
          app: singleApp
        }));
      }
      let { name: app, arguments: appArguments = [] } = options.app || {};
      appArguments = [...appArguments];
      if (Array.isArray(app)) {
        return pTryEach(app, (appName) => baseOpen({
          ...options,
          app: {
            name: appName,
            arguments: appArguments
          }
        }));
      }
      let command;
      const cliArguments = [];
      const childProcessOptions = {};
      if (platform === "darwin") {
        command = "open";
        if (options.wait) {
          cliArguments.push("--wait-apps");
        }
        if (options.background) {
          cliArguments.push("--background");
        }
        if (options.newInstance) {
          cliArguments.push("--new");
        }
        if (app) {
          cliArguments.push("-a", app);
        }
      } else if (platform === "win32" || isWsl && !isDocker()) {
        const mountPoint = await getWslDrivesMountPoint();
        command = isWsl ? `${mountPoint}c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe` : `${process.env.SYSTEMROOT}\\System32\\WindowsPowerShell\\v1.0\\powershell`;
        cliArguments.push("-NoProfile", "-NonInteractive", "\u2013ExecutionPolicy", "Bypass", "-EncodedCommand");
        if (!isWsl) {
          childProcessOptions.windowsVerbatimArguments = true;
        }
        const encodedArguments = ["Start"];
        if (options.wait) {
          encodedArguments.push("-Wait");
        }
        if (app) {
          encodedArguments.push(`"\`"${app}\`""`, "-ArgumentList");
          if (options.target) {
            appArguments.unshift(options.target);
          }
        } else if (options.target) {
          encodedArguments.push(`"${options.target}"`);
        }
        if (appArguments.length > 0) {
          appArguments = appArguments.map((arg) => `"\`"${arg}\`""`);
          encodedArguments.push(appArguments.join(","));
        }
        options.target = Buffer.from(encodedArguments.join(" "), "utf16le").toString("base64");
      } else {
        if (app) {
          command = app;
        } else {
          const isBundled = !__dirname || __dirname === "/";
          let exeLocalXdgOpen = false;
          try {
            await fs2.access(localXdgOpenPath, fsConstants.X_OK);
            exeLocalXdgOpen = true;
          } catch {
          }
          const useSystemXdgOpen = process.versions.electron || platform === "android" || isBundled || !exeLocalXdgOpen;
          command = useSystemXdgOpen ? "xdg-open" : localXdgOpenPath;
        }
        if (appArguments.length > 0) {
          cliArguments.push(...appArguments);
        }
        if (!options.wait) {
          childProcessOptions.stdio = "ignore";
          childProcessOptions.detached = true;
        }
      }
      if (options.target) {
        cliArguments.push(options.target);
      }
      if (platform === "darwin" && appArguments.length > 0) {
        cliArguments.push("--args", ...appArguments);
      }
      const subprocess = childProcess.spawn(command, cliArguments, childProcessOptions);
      if (options.wait) {
        return new Promise((resolve, reject) => {
          subprocess.once("error", reject);
          subprocess.once("close", (exitCode) => {
            if (options.allowNonzeroExitCode && exitCode > 0) {
              reject(new Error(`Exited with code ${exitCode}`));
              return;
            }
            resolve(subprocess);
          });
        });
      }
      subprocess.unref();
      return subprocess;
    };
    var open2 = (target, options) => {
      if (typeof target !== "string") {
        throw new TypeError("Expected a `target`");
      }
      return baseOpen({
        ...options,
        target
      });
    };
    var openApp = (name, options) => {
      if (typeof name !== "string") {
        throw new TypeError("Expected a `name`");
      }
      const { arguments: appArguments = [] } = options || {};
      if (appArguments !== void 0 && appArguments !== null && !Array.isArray(appArguments)) {
        throw new TypeError("Expected `appArguments` as Array type");
      }
      return baseOpen({
        ...options,
        app: {
          name,
          arguments: appArguments
        }
      });
    };
    function detectArchBinary(binary) {
      if (typeof binary === "string" || Array.isArray(binary)) {
        return binary;
      }
      const { [arch]: archBinary } = binary;
      if (!archBinary) {
        throw new Error(`${arch} is not supported`);
      }
      return archBinary;
    }
    function detectPlatformBinary({ [platform]: platformBinary }, { wsl }) {
      if (wsl && isWsl) {
        return detectArchBinary(wsl);
      }
      if (!platformBinary) {
        throw new Error(`${platform} is not supported`);
      }
      return detectArchBinary(platformBinary);
    }
    var apps = {};
    defineLazyProperty(apps, "chrome", () => detectPlatformBinary({
      darwin: "google chrome",
      win32: "chrome",
      linux: ["google-chrome", "google-chrome-stable", "chromium"]
    }, {
      wsl: {
        ia32: "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe",
        x64: ["/mnt/c/Program Files/Google/Chrome/Application/chrome.exe", "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"]
      }
    }));
    defineLazyProperty(apps, "firefox", () => detectPlatformBinary({
      darwin: "firefox",
      win32: "C:\\Program Files\\Mozilla Firefox\\firefox.exe",
      linux: "firefox"
    }, {
      wsl: "/mnt/c/Program Files/Mozilla Firefox/firefox.exe"
    }));
    defineLazyProperty(apps, "edge", () => detectPlatformBinary({
      darwin: "microsoft edge",
      win32: "msedge",
      linux: ["microsoft-edge", "microsoft-edge-dev"]
    }, {
      wsl: "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
    }));
    open2.apps = apps;
    open2.openApp = openApp;
    module2.exports = open2;
  }
});

// src/server.js
var require_server = __commonJS({
  "src/server.js"() {
  }
});

// src/extension.js
var vscode = require("vscode");
var fs = require("fs");
var open = require_open();
var bootServer = require_server();
var global = {};
var cache = {};
global.json = {};
global.isIdle = false;
global.minutesInADay = 1440;
global.timeTillIdle = 5 * 60 * 1e3;
global.fileDir = "time-tracker-storage-mimja";
global.fileName = "time.mim";
global.idleTimeout = null;
module.exports.extensionGlobals = global;
global.currentTime = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = today.getMonth() + 1;
  const dd = today.getDate();
  const hh = today.getHours();
  const min = today.getMinutes();
  const sec = today.getSeconds();
  return [yyyy, mm, dd, hh, min, sec, today];
};
function activate(context) {
  defineCurrentSettings();
  cache.labelPosition = global.labelPosition;
  cache.labelPriority = global.labelPriority;
  cache.iconString = global.iconString;
  vscode.workspace.onDidChangeConfiguration(() => {
    defineCurrentSettings();
    unIdle(null);
    if (global.labelPosition !== cache.labelPosition || global.labelPriority !== cache.labelPriority) {
      vscode.window.showInformationMessage("Reload VSCode to see the changes.", "Reload").then((selection) => {
        if (selection == "Reload") {
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
  });
  global.item = vscode.window.createStatusBarItem(global.labelPosition, global.labelPriority);
  global.item.command = "mimjas-time-tracker.timeStatuesItemClicked";
  context.subscriptions.push(global.item);
  global.item.show();
  context.subscriptions.push(vscode.commands.registerCommand("mimjas-time-tracker.timeStatuesItemClicked", showOnWeb));
  initializeTimeValues();
  updateBarItem();
  initiateCounting();
  unIdle(69);
  vscode.workspace.onDidChangeTextDocument((changeEvent) => unIdle(changeEvent));
  vscode.workspace.onDidCreateFiles((createEvent) => unIdle(createEvent));
  vscode.workspace.onDidDeleteFiles((deleteEvent) => unIdle(deleteEvent));
  vscode.workspace.onDidRenameFiles((renameEvent) => unIdle(renameEvent));
  vscode.window.onDidOpenTerminal((terminal) => unIdle(terminal));
  vscode.window.onDidCloseTerminal((terminal) => unIdle(terminal));
  vscode.window.onDidChangeWindowState((state) => unIdle(state));
  const showCatCommand = "mimjas-time-tracker.showCat";
  const showGraphCommand = "mimjas-time-tracker.showOnWeb";
  context.subscriptions.push(vscode.commands.registerCommand(showCatCommand, showCat));
  context.subscriptions.push(vscode.commands.registerCommand(showGraphCommand, showOnWeb));
}
function showOnWeb() {
  vscode.window.showErrorMessage("This feature has been temporarily disabled do to a bug.");
}
function updateBarItem() {
  let seconds = global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].active;
  let hours = `${seconds / 60 / 60}`.split(".")[0];
  let minutes = `${seconds / 60 - hours * 60}`.split(".")[0];
  let h_s = `${hours} hr`;
  let m_s = `${minutes} min`;
  if (hours <= 0)
    h_s = "";
  if (minutes <= 0)
    m_s = "";
  if (hours > 1)
    h_s = `${h_s}s`;
  if (minutes > 1)
    m_s = `${m_s}s`;
  global.item.text = `${global.iconString} ${h_s} ${m_s}`;
  global.item.tooltip = `Time Spent Coding on ${`${global.currentTime()[1]}/${global.currentTime()[2]}/${global.currentTime()[0]}`}`;
}
function initializeTimeValues() {
  let savedTimeJson;
  try {
    savedTimeJson = fs.readFileSync(`${__dirname}/../../${global.fileDir}/${global.fileName}.json`, "utf8");
  } catch (e) {
    try {
      fs.mkdirSync(`${__dirname}/../../${global.fileDir}/`);
    } catch (e2) {
    }
    ;
    fs.writeFileSync(`${__dirname}/../../${global.fileDir}/${global.fileName}.json`, "{}");
    savedTimeJson = fs.readFileSync(`${__dirname}/../../${global.fileDir}/${global.fileName}.json`, "utf8");
  }
  global.json = checkJson(savedTimeJson);
}
function initiateCounting() {
  clearInterval(global.importantInterval);
  global.importantInterval = setInterval(() => {
    if (global.isIdle)
      return;
    global.json = checkJson(global.json);
    global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].active++;
    if (global.json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].active % 60 == 0) {
      updateBarItem();
      fs.writeFileSync(`${__dirname}/../../${global.fileDir}/${global.fileName}.json`, JSON.stringify(global.json));
    }
  }, 1e3);
}
function checkJson(json) {
  if (typeof json == "string")
    json = JSON.parse(json);
  let hasChanged = false;
  let checkedJson = json;
  let previous = null;
  if (json[global.currentTime()[0]] == void 0) {
    checkedJson[global.currentTime()[0]] = {};
    hasChanged = true;
  }
  previous = json[global.currentTime()[0]];
  if (previous[global.currentTime()[1]] == void 0) {
    checkedJson[global.currentTime()[0]][global.currentTime()[1]] = {};
    hasChanged = true;
  }
  previous = json[global.currentTime()[0]][global.currentTime()[1]];
  if (previous[global.currentTime()[2]] == void 0) {
    checkedJson[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]] = {};
    hasChanged = true;
  }
  previous = json[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]];
  if (previous.active == void 0) {
    checkedJson[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].active = 0;
    hasChanged = true;
  }
  if (previous.day == void 0) {
    let dayKey = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    checkedJson[global.currentTime()[0]][global.currentTime()[1]][global.currentTime()[2]].day = dayKey[global.currentTime()[6].getDay()];
    hasChanged = true;
  }
  if (hasChanged) {
    fs.writeFileSync(`${__dirname}/../../${global.fileDir}/${global.fileName}.json`, JSON.stringify(checkedJson), null, 4);
  }
  return checkedJson;
}
function defineCurrentSettings() {
  global.iconString = vscode.workspace.getConfiguration().get("mimjas-time-tracker.iconStyle");
  if (global.iconString == "") {
    global.iconString = "circuit-board";
    vscode.workspace.getConfiguration().update("mimjas-time-tracker.iconStyle", "circuit-board", vscode.ConfigurationTarget.Global);
  }
  global.iconString = `$(${global.iconString})`;
  if (vscode.workspace.getConfiguration().get("mimjas-time-tracker.labelPosition") == "Left") {
    global.labelPosition = vscode.StatusBarAlignment.Left;
  } else {
    global.labelPosition = vscode.StatusBarAlignment.Right;
  }
  if (vscode.workspace.getConfiguration().get("mimjas-time-tracker.labelPriority")) {
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
  global.timeTillIdle = vscode.workspace.getConfiguration().get("mimjas-time-tracker.timeTillIdle") * 1e3 * 60;
}
function unIdle(event) {
  if (global.isIdle)
    global.isIdle = false;
  if (event != null && !event.focused)
    return;
  clearTimeout(global.idleTimeout);
  global.idleTimeout = setTimeout(() => {
    global.isIdle = true;
    vscode.window.showInformationMessage("Idle mode has been activated. Time will not be logged until you resume coding.");
  }, global.timeTillIdle);
}
function showCat() {
  const panel = vscode.window.createWebviewPanel("catCoding", "Cat Coding", vscode.ViewColumn.One, {});
  panel.webview.html = `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Cat Coding - Image</title>
	</head>
	<body>
		<img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="650" />
	</body>
	</html>`;
}
function deactivate() {
  fs.writeFileSync(`${__dirname}/../../${global.fileDir}/${global.fileName}.json`, JSON.stringify(global.json));
}
module.exports = {
  activate,
  deactivate
};
//# sourceMappingURL=main.js.map
