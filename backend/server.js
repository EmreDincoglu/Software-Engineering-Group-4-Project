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
app.use(cors({
    origin: 'http://localhost:3000'
}));

/*
    Request Definitions:
*/

app.get('/', (req, res) => {
    res.send('Hello from Express!');
});

app.post('/newUser', mongo.createUser);
app.post('/sendMessage', mongo.sendMessage);

/*
    App Start:
*/

app.listen(5000, () => {
    console.log(`Express server listening on port 5000`)
});