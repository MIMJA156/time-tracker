//Variables
let chartMade = false;
let chart;
let timeObject;
let elin = 0;
let shadowElin = 0;

//Real Code

let count = 1;
let connectingInterval = setInterval(() => {
    count++;
    if (count > 3) count = 1;
    $('#statues-img').attr('src', `./SVGS/connecting-${count}.svg`);
}, 500);

$.ajax({
    url: `http://localhost:${document.location.port}/api`,
    method: 'GET',
    success: () => {
        setTimeout(() => {
            clearInterval(connectingInterval);
            $('#statues-img').attr('src', `./SVGS/succeeded.svg`);
            $('#statues-text').text('Connected, loading data...');
            setTimeout(() => {
                $.ajax({
                    url: `http://localhost:${document.location.port}/api/initial-data`,
                    method: 'GET',
                    success: (t) => {
                        timeObject = t;
                        updateChart();
                        move('r', false);
                        move('l', false);

                        setInterval(() => {
                            $('#statues-text').text('Querying Update Data...');
                            setTimeout(() => {
                                $.ajax({
                                    url: `http://localhost:${document.location.port}/api/update-data`,
                                    method: 'GET',
                                    success: (t) => {
                                        $('#statues-text').text('Ready');
                                        timeObject[t.current].active = t.time;
                                        if (elin === 0) {
                                            updateChart();
                                            move('r', false);
                                            move('l', false);
                                        }
                                    },
                                    error: () => {
                                        postError('Server Error while Updating.');
                                    }
                                })
                            }, getRandomTimeout());
                        }, 15 * 1000);
                    },
                    error: () => {
                        postError('Server Error.');
                    }
                })
            }, getRandomTimeout());
        }, getRandomTimeout());
    },
    error: () => {
        setTimeout(() => {
            clearInterval(connectingInterval);
            postError('Failed to connect.');
        }, getRandomTimeout());
    }
});

$('.l').on('click', () => {
    if ($('.l').hasClass('crossed-out')) return;
    move('l', true);
});

$('.r').on('click', () => {
    if ($('.r').hasClass('crossed-out')) return;
    move('r', true);
});

function move(pos, more) {
    let current = timeObject.current.split('/')[0].split('-').concat(timeObject.current.split('/')[1].split('-')).map(x => parseInt(x));

    if (pos === 'r') {
        current[2] += 7;
        if (current[2] > getDaysInMonth(current[1], current[0])) {
            current[2] -= getDaysInMonth(current[1], current[0]);
            current[1]++;
            if (current[1] > 12) {
                current[1] -= 12;
                current[0]++;
            }
        }

        current[5] += 7;
        if (current[5] > getDaysInMonth(current[4], current[3])) {
            current[5] -= getDaysInMonth(current[4], current[3]);
            current[4]++;
            if (current[4] > 12) {
                current[4] -= 12;
                current[3]++;
            }
        }
    } else if (pos === 'l') {
        current[2] -= 7;
        if (current[2] < 1) {
            current[1]--;
            if (current[1] < 1) {
                current[0]--;
                current[1] = 12;
            }
            current[2] = getDaysInMonth(current[1], current[0]) + current[2];
        }

        current[5] -= 7;
        if (current[5] < 1) {
            current[4]--;
            if (current[4] < 1) {
                current[3]--;
                current[4] = 12;
            }
            current[5] = getDaysInMonth(current[4], current[3]) + current[5];
        }
    }

    shadowElin = Object.keys(timeObject).length - 2;

    if (pos === 'r') {
        elin--;
    } else if (pos === 'l') {
        elin++;
    }

    if (elin === 0) {
        $('.r').addClass('crossed-out');
        $(`.l`).removeClass('crossed-out');
    }

    if (elin === shadowElin) {
        $(`.l`).addClass('crossed-out');
        $(`.r`).removeClass('crossed-out');
    }

    if (elin !== shadowElin && elin !== 0) {
        $(`.l`).removeClass('crossed-out');
        $(`.r`).removeClass('crossed-out');
    }

    if (elin === shadowElin && elin === 0) {
        $(`.l`).addClass('crossed-out');
        $(`.r`).addClass('crossed-out');
    }

    if (more) {
        timeObject.current = `${current[0]}-${current[1]}-${current[2]}/${current[3]}-${current[4]}-${current[5]}`;
        updateChart(timeObject);
    }
}

/**
 * This function initiates/updates the chart.
 */
function updateChart() {
    if (chartMade) {
        console.log("Updating chart...");
        $('#current-date').text(timeObject.current);
        chart.options.plugins.tooltip.callbacks.label = chart.options.plugins.tooltip.callbacks.label;
        chart.data.datasets[0].data = timeObject[timeObject.current].active
        chart.update();
    } else {
        try {
            chart = new Chart($('#chart'), {
                type: 'bar',
                data: {
                    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
                        'Saturday'
                    ],
                    datasets: [{
                        label: 'Time Spent Coding This Week',
                        data: timeObject[timeObject.current].active,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(255, 205, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(201, 203, 207, 0.2)'
                        ],
                        borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(201, 203, 207)'
                        ],
                        borderWidth: 1,
                    }]
                },
                options: {
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let hours = `${(timeObject[timeObject.current].active[context.dataIndex] / 60) /
                                60}`.split('.')[0];
                                    let minutes = `${((timeObject[timeObject.current].active[context.dataIndex] / 60) - (hours *
                                60))}`.split('.')[0];

                                    let h_s = `${hours} hr`;
                                    let m_s = `${minutes} min`;

                                    if (hours <= 0) h_s = '';
                                    if (minutes <= 0) m_s = '';
                                    if (hours > 1) h_s = `${h_s}s`;
                                    if (minutes > 1) m_s = `${m_s}s`;

                                    if (h_s == '' && m_s == '') {
                                        h_s = ' Less than';
                                        m_s = '1 min';
                                    }

                                    return `${h_s} ${m_s}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            chartMade = true;
            $('#loading-img').css('display', 'none');
            $('#statues-text').text('Ready');
            $('#current-date').text(timeObject.current);
        } catch (err) {
            postError('Unknown Error Occurred.');
            console.log(err);
        }
    }
}

/**
 * Call an error to be displayed.
 */
function postError(errMsg) {
    $('#statues-img').attr('src', `./SVGS/failed.svg`);
    $('#loading-img-dis').attr('src', `./SVGS/failed.svg`);
    $('#statues-text').text(errMsg);
    $('#current-date').text('Undefined');
}

/**
 * This function returns a random timeout value between 500 and 2000 milliseconds.
 * @returns {number} random timeout value
 */
function getRandomTimeout() {
    return Math.floor(Math.random() * (2000)) + 500;
}

/**
 * @param {number} month 
 * @param {number} year 
 * @returns {number} The number of days in the month specified.
 */
function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
};