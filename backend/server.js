/*
    Imports:
*/

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongo = require('./mongoose.js');

/*
    App Definition:
*/

const app = express();

app.use(bodyParser.json());
app.use(cors({origin: ['http://localhost:3000'], credentials: true}));

/*
    Request Definitions:
*/

app.get('/authSession', mongo.authSession);
app.get('/authSpotify', mongo.authSpotify);

app.post('/createUser', mongo.createUser);
app.post('/createSession', mongo.createSession);
app.post('/uploadSpotifyAuth', mongo.uploadSpotifyAuth);
app.post('/sendMessage', mongo.sendMessage);

/*
    App Start:
*/

app.listen(5000, () => {
    console.log(`Express server listening on port 5000`)
});