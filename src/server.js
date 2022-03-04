const path = require("path");
const port = 3217
const express = require("express");
const fs = require("fs");
const {
    fileDir,
    fileName
} = require("./extension.js");

module.exports = () => {
    bootServer();
    return port;
};

function bootServer() {
    let app = express();

    app.use(express.static(path.join(__dirname, "../public/")));

    app.get('/api', (req, res) => {
        res.send('The server is up and running!');
    });

    app.get('/api/initial-data', (req, res) => {
        res.send("HALLO");
    });

    app.get('/api/update-data', (req, res) => {
        res.send("HALLO");
    });

    app.listen(port, () => {
        return port;
    });
}