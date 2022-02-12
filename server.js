const port = 3457;
const express = require('express');

function bootServer() {
    let app = express();

    app.use(express.static(`${__dirname}/public/`));
    app.listen(port);

    return port;
}

module.exports = bootServer;