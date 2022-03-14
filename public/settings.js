function windowIsReady() {
    console.log('Window is ready.');
    if (graphType == 'line') {
        $('#line-graph').trigger('click');
    } else {
        $('#bar-graph').trigger('click');
    }

    $('#open-settings').on('click', () => {
        if ($('#settings-menu-body').css('display') === 'flex') {
            $('#settings-menu-body').css('display', 'none');
        } else {
            $('#settings-menu-body').css('display', 'flex');
        }
    });

    $('#close-settings').on('click', () => {
        $('#settings-menu-body').css('display', 'none');
    });

    $('#line-graph').on('click', () => {
        graphType = 'line';
        destroyChart();
        updateChart();
        updateSettings();
    });

    $('#bar-graph').on('click', () => {
        graphType = 'bar';
        destroyChart();
        updateChart();
        updateSettings();
    });
}

function updateSettings() {
    $.ajax({
        url: `http://localhost:${document.location.port}/api/update-settings`,
        method: 'POST',
        dataType: 'json',
        data: {
            graphType: graphType
        }
    });
}