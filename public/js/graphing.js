//Variables
let chartMade = false;
let chart;
let timeObject;
let elin = 0;
let shadowElin = 0;
let graphType = 'lol';
let colors = ['lol'];

let fontFamily = 'lol';

//Real Code
let count = 1;
let connectingInterval = setInterval(() => {
    count++;
    if (count > 3) count = 1;
    $('#statues-img').attr('src', `./svgs/connecting-${count}.svg`);
}, 500);

$.ajax({
    url: `http://localhost:${document.location.port}/api`,
    method: 'GET',
    success: (settings) => {
        graphType = settings.web.graph.type;
        colors = settings.web.graph.colors;
        fontFamily = settings.web.font;
        setTimeout(() => {
            clearInterval(connectingInterval);
            $('#statues-img').attr('src', `./svgs/succeeded.svg`);
            $('#statues-text').text('Loading data...');
            setTimeout(() => {
                $.ajax({
                    url: `http://localhost:${document.location.port}/api/initial-data`,
                    method: 'GET',
                    success: (t) => {
                        timeObject = t;
                        updateChart();
                        defineCurrentSanity(timeObject);
                        windowIsReady();
                        move('r', false);
                        move('l', false);

                        setInterval(() => {
                            $('#statues-text').text('Updating...');
                            setTimeout(() => {
                                $.ajax({
                                    url: `http://localhost:${document.location.port}/api/update-data`,
                                    method: 'GET',
                                    success: (t) => {
                                        defineCurrentSanity(timeObject);
                                        $('#statues-text').text('Ready');
                                        $('#statues-img').attr('src', `./svgs/succeeded.svg`);

                                        try {
                                            timeObject[t.current].active = t.time;
                                        } catch (e) {
                                            $.ajax({
                                                url: `http://localhost:${document.location.port}/api/initial-data`,
                                                method: 'GET',
                                                success: (t) => {
                                                    timeObject = t;
                                                    updateChart();
                                                    defineCurrentSanity(timeObject);
                                                    move('r', false);
                                                    move('l', false);
                                                }
                                            });
                                        }

                                        if (elin === 0) {
                                            updateChart();
                                            move('r', false);
                                            move('l', false);
                                        }
                                    },
                                    error: () => {
                                        postError('Server Error while Updating.');
                                        destroyChart();
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
    defineCurrentSanity(timeObject);
});

$('.r').on('click', () => {
    if ($('.r').hasClass('crossed-out')) return;
    move('r', true);
    defineCurrentSanity(timeObject);
});

/**
 * This function moves the chart to the left or to the right.
 * @param {string} pos can be either 'L' or 'R'
 * @param {boolean} more decides if the chart is actually moved or not.
 */
function move(pos, more) {
    pos = pos.toLowerCase();

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
        $('#current-date').text(timeObject.current);
        chart.options.plugins.tooltip.callbacks.label = chart.options.plugins.tooltip.callbacks.label;
        chart.data.datasets[0].data = timeObject[timeObject.current].active.map(x => {
            x = Math.floor(x / 60);
            if (x < 1) x = 0;
            return x;
        });
        chart.data.datasets[0].backgroundColor = colors.map(x => `${x}33`);
        chart.data.datasets[0].borderColor = colors;
        chart.update();
    } else {
        try {
            chart = new Chart($('#chart'), {
                type: graphType,
                data: {
                    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
                        'Saturday'
                    ],
                    datasets: [{
                        label: 'Time Spent Coding This Week',
                        tension: 0.1,
                        data: timeObject[timeObject.current].active.map(x => {
                            x = Math.floor(x / 60);
                            if (x < 1) x = 0;
                            return x;
                        }),
                        backgroundColor: colors.map(x => `${x}33`),
                        borderColor: colors,
                        borderWidth: 1,
                        pointRadius: 10,
                        pointHoverRadius: 15,
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    onClick: (e) => {
                        let points = chart.getElementsAtEventForMode(e, 'nearest', {
                            intersect: true
                        }, true);

                        if (points.length) {
                            let point = points[0];
                            let label = chart.data.labels[point.index];
                            let value = chart.data.datasets[point.datasetIndex].data[point.index];
                            console.log(`${label}: ${value} minutes`);
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
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
                                        h_s = ' No Time Spent';
                                        m_s = '';
                                    }
                                    let maxSanity = 100;
                                    let sanity = maxSanity;
                                    let totalTime = timeObject[timeObject.current].active[context.dataIndex];

                                    sanity = sanity - Math.floor((totalTime / 60) / 15);

                                    return [`${h_s} ${m_s}`, `Sanity ${sanity}%`];
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                autoSkip: false,
                                maxTicksLimit: 10,
                                stepSize: 30,
                                callback: function (value) {
                                    if (value % 60 === 0) return `${value / 60} hr`;
                                    return `${((value / 60 - 0.5) <= 0) ? "" : `${(value / 60 - 0.5)} hr`} ${value - Math.floor((value / 60)) * 60} min`;
                                }
                            }
                        }
                    }
                }
            });

            chartMade = true;
            $('#loading-img').css('display', 'none');
            $('#chart-container').css('display', 'block');
            $('#statues-text').text('Ready');
            $('#current-date').text(timeObject.current);
        } catch (err) {
            postError('Unknown Error Occurred.');
            console.log(err);
        }
    }
}


/**
 * Destroys the current instance of the chart safely.
 */
function destroyChart() {
    chart.destroy();
    chartMade = false;
}

/**
 * Call an error to be displayed.
 */
function postError(errMsg) {
    $('#loading-img').css('display', 'flex');
    $('#chart-container').css('display', 'none');
    $('#statues-img').attr('src', `./svgs/failed.svg`);
    $('#loading-img-dis').attr('src', `./svgs/failed.svg`);
    $('#statues-text').text(errMsg);
    $('#current-date').text('Undefined');
    $(`.l`).addClass('crossed-out');
    $(`.r`).addClass('crossed-out');
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

/**
 * This function will define the current percent of sanity.
 * @param {number} hoursInTotal 
 */
function defineCurrentSanity(hoursInTotal) {
    let maxSanity = 100;
    let sanity = maxSanity;
    let totalTime = hoursInTotal[hoursInTotal.current].active.reduce((partialSum, a) => partialSum + a, 0);

    sanity = sanity - Math.floor((totalTime / 60) / 15);

    $('#sanity-percent').text(`${Math.floor((sanity/maxSanity) * 100)}`);
}