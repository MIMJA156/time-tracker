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

var chartMade = false;
var chart = null;

let count = 1;
let connectingInterval = setInterval(() => {
    count++;
    if (count > 3) count = 1;
    $('#statues-img').attr('src', `./SVGS/connecting-${count}.svg`);
}, 500);

$.ajax({
    url: `http://localhost:${document.location.port}/api`,
    method: 'GET',
    success: (data) => {
        setTimeout(() => {
            clearInterval(connectingInterval);
            $('#statues-img').attr('src', `./SVGS/succeeded.svg`);
            $('#statues-text').text('Connected, loading data...');
            setTimeout(() => {
                $.ajax({
                    url: `http://localhost:${document.location.port}/api/initial-data`,
                    method: 'GET',
                    success: (data) => {
                        updateChart(timeData);
                    }
                })
            }, getRandomTimeout());
        }, getRandomTimeout());
    },
    error: (err) => {
        setTimeout(() => {
            clearInterval(connectingInterval);
            $('#statues-img').attr('src', `./SVGS/failed.svg`);
            $('#statues-text').text('Failed to connect.');
        }, getRandomTimeout());
    }
});

/**
 * This function initiates/updates the chart.
 */
function updateChart(timeData) {
    if (chartMade) {
        console.log("Updating chart...");
    } else {
        chart = new Chart($('#chart'), {
            type: 'line',
            data: {
                labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
                    'Saturday'
                ],
                datasets: [{
                    label: 'Time Spent Coding This Week',
                    backgroundColor: ['#000000'],
                    data: timeData[timeData.current].active,
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
    }
}

/**
 * This function returns a random timeout value between 500 and 2000 milliseconds.
 * @returns {number} random timeout value
 */
function getRandomTimeout() {
    return Math.floor(Math.random() * (2000)) + 500;
}