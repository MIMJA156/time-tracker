function initializeKeyBindings() {
    $('body').on('keyup', (e) => {
        if (e.key === 'ArrowRight') {
            $('.r').trigger('click');
        }

        if (e.key === 'ArrowLeft') {
            $('.l').trigger('click');
        }

        if (e.key === 'ArrowUp') {
            $('#open-settings').trigger('click');
        }
    })
}