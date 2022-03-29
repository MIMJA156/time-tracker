let shown = false;
let a;
let b;
let defaultColors = ["#FF6384", "#FF9F40", "#FFCD56", "#4BC0C0", "#36A2EB", "#9966FF", "#C9CBCF"];

function bootSettingsWindow() {
    $('#open-settings').on('click', () => {
        if ($('#settings-menu-body').css('display') === 'flex') {
            $('#settings-menu-body').css('display', 'none');
            if (shown) {
                $('#reset-settings-pos').css('display', 'none');
            }
        } else {
            $('#settings-menu-body').css('display', 'flex');
            if (shown) {
                $('#reset-settings-pos').css('display', 'block');
            }
        }
    });

    $('#close-settings').on('click', () => {
        $('#settings-menu-body').css('display', 'none');
        $('#reset-settings-pos').css('display', 'none');
    });

    if (graphType == 'line') {
        $('#line-graph').trigger('click');
    } else {
        $('#bar-graph').trigger('click');
    }

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


    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (document.getElementById("settings-header")) {
        document.getElementById("settings-header").onmousedown = dragMouseDown;
    } else {
        document.getElementById("settings-menu-body").onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.getElementById("settings-menu-body").style.top = (document.getElementById("settings-menu-body").offsetTop - pos2) + "px";
        document.getElementById("settings-menu-body").style.left = (document.getElementById("settings-menu-body").offsetLeft - pos1) + "px";
        if (shown === false) {
            $('#reset-settings-pos').css('display', 'block');
            shown = true;
        }
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    function resetPos() {
        document.getElementById("settings-menu-body").style.top = '50%';
        document.getElementById("settings-menu-body").style.left = '50%';
    }

    $('#reset-settings-pos').on('click', () => {
        resetPos();
        $('#reset-settings-pos').css('display', 'none');
        shown = false;
    });

    a = [...colors];

    setColorItems(colors);
    colorChanged();

    $('#sunday-color-selector').on('change', () => {
        colors[0] = $('#sunday-color-selector').val();
        updateChart();
        colorChanged();
    })

    $('#monday-color-selector').on('change', () => {
        colors[1] = $('#monday-color-selector').val();
        updateChart();
        colorChanged();
    })

    $('#tuesday-color-selector').on('change', () => {
        colors[2] = $('#tuesday-color-selector').val();
        updateChart();
        colorChanged();
    })

    $('#wednesday-color-selector').on('change', () => {
        colors[3] = $('#wednesday-color-selector').val();
        updateChart();
        colorChanged();
    })

    $('#thursday-color-selector').on('change', () => {
        colors[4] = $('#thursday-color-selector').val();
        updateChart();
        colorChanged();
    })

    $('#friday-color-selector').on('change', () => {
        colors[5] = $('#friday-color-selector').val();
        updateChart();
        colorChanged();
    })

    $('#saturday-color-selector').on('change', () => {
        colors[6] = $('#saturday-color-selector').val();
        updateChart();
        colorChanged();
    })

    $('#color-selector-save').on('click', () => {
        if (confirm("Are you sure to execute this action?")) {
            if (!$('#color-selector-save').hasClass('crossed-out')) {
                updateSettings();
                colorChanged();
                a = [...colors];
                $('#color-selector-save').addClass('crossed-out');
                $('#color-selector-revert').addClass('crossed-out');
            }
        }
    })

    $('#color-selector-revert').on('click', () => {
        if (!$('#color-selector-revert').hasClass('crossed-out')) {
            if (confirm("Are you sure to execute this action?")) {
                colors = [...a];
                setColorItems(colors);
                updateChart();
                colorChanged();
                $('#color-selector-revert').addClass('crossed-out');
                $('#color-selector-save').addClass('crossed-out');
            }
        }
    })

    $('#color-selector-reset').on('click', () => {
        if (!$('#color-selector-reset').hasClass('crossed-out')) {
            if (confirm("Are you sure to execute this action?")) {
                colors = [...defaultColors];
                setColorItems(colors);
                updateChart();
                colorChanged();

                if (colors.equals(a)) {
                    $('#color-selector-save').addClass('crossed-out');
                    $('#color-selector-revert').addClass('crossed-out');
                }
            }
        }
    })

    $(`#font-family-selection option[value="${fontFamily}"]`).attr('selected', 'selected');
    $('*').css('font-family', fontFamily);

    $('#font-family-selection').on('change', () => {
        fontFamily = $("#font-family-selection option:selected").val();
        updateSettings();
        $('*').css('font-family', fontFamily);
    });
}

function colorChanged() {
    if (!colors.equals(a)) {
        $('#color-selector-save').removeClass('crossed-out');
    }

    if (!colors.equals(a)) {
        $('#color-selector-revert').removeClass('crossed-out');
    }

    if (colors.equals(defaultColors)) {
        $('#color-selector-reset').addClass('crossed-out');
    } else {
        $('#color-selector-reset').removeClass('crossed-out');
    }
}

function updateSettings() {
    $.ajax({
        url: `http://localhost:${document.location.port}/api/update-settings`,
        method: 'POST',
        dataType: 'json',
        data: {
            graphType: graphType,
            colors: colors,
            fontFamily: fontFamily
        }
    });
}

function setColorItems(c) {
    $('#sunday-color-selector').val(c[0]);
    $('#monday-color-selector').val(c[1]);
    $('#tuesday-color-selector').val(c[2]);
    $('#wednesday-color-selector').val(c[3]);
    $('#thursday-color-selector').val(c[4]);
    $('#friday-color-selector').val(c[5]);
    $('#saturday-color-selector').val(c[6]);
}