var given = {
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
        active: [500, 500, 500, 5000, 500, 500, 500]
    }
};

var chartMade = false;
var chart = null;

$('#current-date').text(given.current);

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
                        updateChart(given);
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
function updateChart(data) {
    if (chartMade) {

    } else {
        chart = new Chart($('#chart'), {
            type: 'bar',
            data: {
                labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
                    'Saturday'
                ],
                datasets: [{
                    label: 'Time Spent Coding This Week',
                    backgroundColor: ['#000000'],
                    data: given[given.current].active,
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let hours = `${(given[given.current].active[context.dataIndex] / 60) /
                                60}`.split('.')[0];
                                let minutes = `${((given[given.current].active[context.dataIndex] / 60) - (hours *
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
                }
            }
        });

        chartMade = true;
        $('#statues-text').text('Ready');
    }
}

/**
 * This function returns a random timeout value between 500 and 2000 milliseconds.
 * @returns {number} random timeout value
 */
function getRandomTimeout() {
    return Math.floor(Math.random() * (2000)) + 500;
}