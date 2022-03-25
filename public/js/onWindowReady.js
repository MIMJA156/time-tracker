function windowIsReady() {
    console.log('Window is ready.');

    bootSettingsWindow();
}

Array.prototype.equals = function (a2) {
    return this.every((v, i) => v === a2[i]);
}