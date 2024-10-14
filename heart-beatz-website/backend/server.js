const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongo = require('./mongoose.js');

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.post('/newUser', mongo.createUser);

app.listen(5000);