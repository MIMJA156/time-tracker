function windowIsReady() {
    console.log('Window is ready.');

    bootSettingsWindow();

    initializeKeyBindings();
}

Array.prototype.equals = function (a2) {
    return this.every((v, i) => v === a2[i]);
}