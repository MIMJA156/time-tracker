let shown = false;

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

    //Make settings draggable
    dragElement(document.getElementById("settings-menu-body"));

    function dragElement(elmnt) {
        var pos1 = 0,
            pos2 = 0,
            pos3 = 0,
            pos4 = 0;
        if (document.getElementById("settings-header")) {
            // if present, the header is where you move the DIV from:
            document.getElementById("settings-header").onmousedown = dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

            if (shown === false) {
                $('#reset-settings-pos').css('display', 'block');
                shown = true;
            }
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }

        function resetPos() {
            elmnt.style.top = '50%';
            elmnt.style.left = '50%';
        }

        $('#reset-settings-pos').on('click', () => {
            resetPos();
            $('#reset-settings-pos').css('display', 'none');
            shown = false;
        });
    }
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