const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')

const path = require('path');

const api = require('./api');

const httpPort = 5000;

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cors());

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

api.use(app);

app.listen(httpPort, function () {
  console.log(`Listening on port ${httpPort}!`);
});


