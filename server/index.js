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

//////////////////////////////////
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

// http://localhost:3000/
require('./config/passport');

app.get('/auth/logout', (req,res) => {
  req.logout();
  res.redirect('/');
})

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile']
}));

app.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
  // dev mode: http://localhost:3000/   prod mode: /
  res.redirect('/');
});
/*
const authCheck = (req, res, next) => {
  if (req.user) {
    // If logged in
    next();
  } else {
    // If user is not logged in
    res.redirect('/');
  }
};
*/
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
//////////////////////

// MongoDB connection
const Business = require('./models/Business');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise; 

// Priority serve any static files
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Cross Origin Resource Sharing
app.use(cors());
app.options('*', cors());

// Middleware to parse all incoming requests into JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));

// Answer API requests
const routes = require('./routes');
app.use('/', routes);

// All remaining requests return the React app, so it can handle routing
app.route('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

// Server listen
app.listen(PORT, () => console.log(`Express is listening on port ${PORT}`))