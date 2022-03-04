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
        active: [500, 500, 500, 500, 500, 500, 500]
    }
};

const string = given.current;

$('#current-date').text(string);

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
 * This function returns a random timeout value between 500 and 2000 milliseconds.
 * @returns {number} random timeout value
 */
function getRandomTimeout() {
    return Math.floor(Math.random() * (2000)) + 500;
}