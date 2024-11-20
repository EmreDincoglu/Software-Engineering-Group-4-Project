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
app.post('/createPost', mongo.createPost);
//likePost and block user are like a switch, if you call likePost and its already liked it will unlike it and vise versa
app.post('/likePost', mongo.likePost);
app.post('/blockUser', mongo.blockUser);
app.post('/followUser', mongo.followUser);

app.delete('/deleteUser', mongo.deleteUser);

app.put('/endSession', mongo.endSession);
app.put('/editProfile', mongo.editProfile);
app.put('/updateUser', mongo.updateUser)

/*
    App Start:
*/

app.listen(5000, () => {
    console.log(`Express server listening on port 5000`)
});