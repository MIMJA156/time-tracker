function windowIsReady() {
    console.log('Window is ready.');

    bootSettingsWindow();

    initializeKeyBindings();
}

function disableWindow() {
    $('#close-settings').trigger('click');
    $('#open-settings').attr("disabled", "true");
}

function enableWindow() {
    $('#open-settings').removeAttr("disabled")
    console.log('ran enableWindow');
}

Array.prototype.equals = function (a2) {
    return this.every((v, i) => v === a2[i]);
}