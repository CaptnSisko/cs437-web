const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const path = require('path');

const api = require('./api');

const httpPort = 5000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cors());

if (mongoose.connection.readyState === 0) {
  mongoose.connect('mongodb://127.0.0.1:30000/cs437', {autoIndex: false}).then(() => {
    console.log('Mongo connection created');
  });
}

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

api.use(app);

app.listen(httpPort, function () {
  console.log(`Listening on port ${httpPort}!`);
});


