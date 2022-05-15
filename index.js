const express = require('express');
const cors = require('cors');
const keys = require('./secret').keys;
const webpush = require('web-push');
const bodyParser = require('body-parser')

const path = require('path');

const api = require('./api');

const httpPort = 5000;

const app = express();

let subscriptions = [];

webpush.setVapidDetails(keys.email, keys.publicVapidKey,keys.privateVapidKey);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cors());

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

//subscribe route
app.post('/subscribe', (req, res)=>{
  //get push subscription object from the request
  subscription = req.body;

  subscriptions.push(subscription);

  //send status 201 for the request
  res.status(201).json({})

  //create paylod: specified the detals of the push notification
  const payload = JSON.stringify({title: 'Successfully Enabled Push Notifications', body: 'Nice Work!' });

  //pass the object into sendNotification fucntion and catch any error
  webpush.sendNotification(subscription, payload).catch(err=> console.error(err));
});

function sendNotification(title, body) {
  //create paylod: specified the detals of the push notification
  const payload = JSON.stringify({title: title, body: body });

  //pass the object into sendNotification fucntion and catch any error
  for(const subscription of subscriptions) {
    webpush.sendNotification(subscription, payload).catch(err=> {
      for(let i = 0; i < subscriptions.length; i++) {
        if(subscriptions[i] === subscription) subscriptions.splice(i, 1);
      }
    });
  }

}

api.use(app, sendNotification);

app.listen(httpPort, function () {
  console.log(`Listening on port ${httpPort}!`);
});

