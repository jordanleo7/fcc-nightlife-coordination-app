// Express
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded({ extended: false });
const router = express.Router();
const passport = require('passport');
require('dotenv').config();

const app = express();
const cookieSession = require('cookie-session');

const PORT = process.env.PORT || 3001;

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Cross Origin Resource Sharing
app.use(cors());
app.options('*', cors());

//
// User authentication
//
app.use(cookieSession({
  // 24 hour session
  maxAge: 24 * 60 * 60 * 1000,
  keys: [process.env.SESSION_COOKIE_KEY]
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


//
// MongoDB
//
//const Poll = require('./models/Poll');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

//
// User authentication
// http://localhost:3000/
require('./config/passport');

app.get('/auth/logout', (req,res) => {
  req.logout();
  res.redirect('/');
})

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile']
}));
// http://localhost:3000/mypolls
app.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
  res.redirect('/mypolls');
});

const authCheck = (req, res, next) => {
  if (req.user) {
    // If logged in
    next();
  } else {
    // If user is not logged in
    res.redirect('/auth/login');
  }
};

app.get('/isLoggedIn', function (req, res) {
  if (req.user) {
    console.log(req.user);
    res.send(req.user);
  } else {
    console.log('Not logged in');
    res.send('Not logged in');
  }
})

//
// Answer API requests.
//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));

//
// Yelp API
//
const yelp = require('yelp-fusion');
const yelpAPIKey = process.env.YELP_API_KEY;
const client = yelp.client(yelpAPIKey);

app.get('/api/yelp/search/*', function (req, res) {
  const searchRequest = {
    term: 'Starbucks',
    location: 'San Francisco, CA'
  };
  client.search(searchRequest).then(response => {
    const firstResult = response.jsonBody.businesses; // [0]
    const prettyJSON = JSON.stringify(firstResult, null, 4);
    console.log(prettyJSON);
    res.send(firstResult);
  }).catch(e => {
    console.log(e);
  });
}) 





// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => console.log(`Express listening on port ${PORT}`))