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

$('#check').on('click', () => {
    if ($('#check').is(":checked")) {
        $('#f-text').text(string);
        $('#b-text').text(string);
    } else {
        $('#f-text').text('');
        $('#b-text').text('');
    }
});