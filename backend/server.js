/*
    Imports:
*/

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongo = require('./mongoose.js');
/*
    App Definition:
*/

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({origin: ['http://localhost:3000', 'http://localhost:3000/login', 'http://localhost:3000/home'], credentials: true}));

/*
    Request Definitions:
*/

app.get('/authSession', mongo.authSession);
app.get('/getUserData', mongo.getUserData);
app.get('/authSpotify', mongo.authSpotify);
app.get('/getMessages', mongo.getMessages);
app.get('/getProfile', mongo.getProfile);

app.post('/createUser', mongo.createUser);
app.post('/createSession', mongo.createSession);
app.post('/uploadSpotifyAuth', mongo.uploadSpotifyAuth);
app.post('/sendMessage', mongo.sendMessage);

app.put('/editProfile', mongo.editProfile);

/*
    App Start:
*/

app.listen(5000, () => {
    console.log(`Express server listening on port 5000`)
});