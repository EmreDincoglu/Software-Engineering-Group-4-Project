const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongo = require('./mongoose.js');

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.post('/newUser', mongo.createUser);

app.post('/sendMessage', mongo.sendMessage);

app.listen(5000, () => {
  console.log(`Express server listening on port 5000`)
});