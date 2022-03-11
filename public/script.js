//Variables
let chartMade = false;
let chart;
let timeObject;
let currentButton = null;

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
                        updateChart(t);
                        move('r', false);
                        move('l', false);
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
    if (!$('.l').hasClass('crossed-out')) {
        move('l');
    }
});

$('.r').on('click', () => {
    if (!$('.r').hasClass('crossed-out')) {
        move('r');
    }
});

function move(pos) {
    let current = timeObject.current.split('/')[0].split('-').concat(timeObject.current.split('/')[1].split('-')).map(x => parseInt(x));

    console.log(current);
    console.log(pos);
}

/**
 * This function initiates/updates the chart.
 */
function updateChart(timeData) {
    if (chartMade) {
        chart.data.datasets[0].data = timeData[timeData.current].active;
        console.log(chart.options.plugins.tooltip.callbacks.label);
        chart.update();
    } else {
        console.log(timeData);
        try {
            chart = new Chart($('#chart'), {
                type: 'bar',
                data: {
                    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
                        'Saturday'
                    ],
                    datasets: [{
                        label: 'Time Spent Coding This Week',
                        data: timeData[timeData.current].active,
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
                                    let hours = `${(timeData[timeData.current].active[context.dataIndex] / 60) /
                                60}`.split('.')[0];
                                    let minutes = `${((timeData[timeData.current].active[context.dataIndex] / 60) - (hours *
                                60))}`.split('.')[0];

                                    let h_s = `${hours} hr`;
                                    let m_s = `${minutes} min`;

                                    if (hours <= 0) h_s = '';
                                    if (minutes <= 0) m_s = '';
                                    if (hours > 1) h_s = `${h_s}s`;
                                    if (minutes > 1) m_s = `${m_s}s`;

                                    if (h_s == '' && m_s == '') {
                                        m_s = '0 min';
                                        h_s = '0 hr';
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
            $('#current-date').text(timeData.current);
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