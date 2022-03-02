const path = require("path");
const port = 3217
const express = require("express");

module.exports = () => {
    bootServer();
    return port;
};

function bootServer() {
    let app = express();

    app.use(express.static(path.join(__dirname, "../public/")));

    app.get('/api/', (req, res) => {
        res.send('The server is up and running!');
    });

    app.get('/api/initial-data', (req, res) => {

    });

    app.get('/api/update-data', (req, res) => {

    });

    app.listen(port, () => {
        return port;
    });
}