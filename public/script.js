//Variables
let chartMade = false;
let chart;
let timeObject;
let positionInTime = 1;

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
    console.log("left");
    move('l', true);
});

$('.r').on('click', () => {
    console.log("right");
    move('r', true);
});

function move(pos, type) {
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
            current[2] = getDaysInMonth(current[1], current[0]);
            if (current[1] < 1) {
                current[0]--;
                current[1] = 12;
            }
        }

        current[5] -= 7;
        if (current[5] < 1) {
            current[4]--;
            current[5] = getDaysInMonth(current[4], current[3]);
            if (current[4] < 1) {
                current[3]--;
                current[4] = 12;
            }
        }
    }

    console.log(current);

    if (timeObject[`${current[0]}-${current[1]}-${current[2]}/${current[3]}-${current[4]}-${current[5]}`] === undefined) {
        $(`.${pos}`).addClass('crossed-out');
    } else {
        $(`.${pos}`).removeClass('crossed-out');
    }

    if (type) {
        timeObject.current = `${current[0]}-${current[1]}-${current[2]}/${current[3]}-${current[4]}-${current[5]}`;
        move((pos === 'l') ? 'r' : 'l', false);
    }
}

/**
 * This function initiates/updates the chart.
 */
function updateChart(timeData) {
    if (chartMade) {
        console.log("Updating chart...");
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

/*
var timeData = {
    current: "2022-1-23/2022-1-29",
    "2022-1-2/2022-1-8": {
        active: [2000, 2000, 2000, 2000, 2000, 2000, 2000]
    },
    "2022-1-9/2022-1-15": {
        active: [1500, 1500, 1500, 1500, 1500, 1500, 1500]
    },
    "2022-1-16/2022-1-22": {
        active: [1000, 1000, 1000, 1000, 1000, 1000, 1000]
    },
    "2022-1-23/2022-1-29": {
        active: [500, 500, 500, 3000, 500, 500, 500]
    }
};
*/