// Express
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const urlEncodedParser = bodyParser.urlencoded({ extended: false });
const router = express.Router();
const passport = require('passport');
const Promise = require('bluebird');
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
const Business = require('./models/Business');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
// mongoose.Promise = global.Promise; 
// Use bluebird
mongoose.Promise = require('bluebird');
//
// User authentication
// http://localhost:3000/
require('./config/passport');

app.get('/auth/logout', (req,res) => {
  req.logout();
  res.redirect('http://localhost:3000/');
})

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile']
}));


app.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
  // dev mode: http://localhost:3000/   prod mode: /
  res.redirect('http://localhost:3000/');
});

const authCheck = (req, res, next) => {
  if (req.user) {
    // If logged in
    next();
  } else {
    // If user is not logged in
    res.redirect('/');
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

app.get('/api/yelp/search/:id', urlEncodedParser, function (req, res) {

  const searchRequest = {
    location: req.params.id,
    categories: 'Nightlife'
  };

  client.search(searchRequest)
    .then(response => {

      let searchResults = response.jsonBody.businesses;

      for (let i = 0; i < searchResults.length; i++) {
        Business.findOne({'id': searchResults[i].id}, function (business) {
          if (business) {
            addTotalGoing(i, business.totalGoing);
          } else {
            addTotalGoing(i, 0);
          }
        })
      }

      function addTotalGoing(i, totalGoing) {
        searchResults[i]["going"] = totalGoing
      }

      console.log(searchResults);
      res.send(searchResults);

    })
    .catch(e => {
      console.log(e);
    });

}) 

/*
    function test() {
      for (let i = 0; i < searchResults.length; i++) {
        Business.findOne({'id': searchResults[i].id}, function (err, business) {
          if (business) {
            searchResults[i]["going"] = business.totalGoing;
          } else {
            searchResults[i]["going"] = 0;
          }
        })
      }
    }

*/

    /*
    let Going = Promise.map(searchResults, function (searchResult) {
      Business.findOne({'id': searchResult.id}), function (err, doc) {

        console.log('hello', doc);
      }
    }).then(function() {
      console.log('done son');
    });
*/

    /*
    function test() {
      for (let i = 0; i < searchResults.length; i++) {
        Business.findOne({'id': searchResults[i].id}, function (err, business) {
          if (business) {
            searchResults[i]["going"] = business.totalGoing;
          } else {
            searchResults[i]["going"] = 0;
          }
        })
      }
    }

    test();
*/
    /*
      function getGoingCount(i, callback) {
        Business.findOne({'id':Results[i]["id"]}, function(err,doc){
          if(doc){
            callback(null, doc.totalGoing);
          }else {
            console.log('There was an error getting the postsCount');
            callback(true, null);
           }
        })
      }

      for (let i = 0; i < Results.length; i++) {

        getGoingCount(function(error, ))

    }
    */
    /*let Going = Results.map((business, index) => {
      Business.findOne({'id': business.id}), function (err, doc) {
        return doc;
      }
    })*/

    /*for (let i = 0; i < Results.length; i++) {
      Results[i]["going"] = 0;
      Business.findOne({'id': Results[i].id}, function (err, business) {
        if (business) {
          Results[i]["going"] = business.totalGoing;
        }
      }) 
    }*/

    /*
    let goingResults = Results.map((business, index) => {
      Business.findOne({'id': business.id}, function (err, biz) {
        let temp = biz;
        if (biz) {
          //let tg = business.totalGoing;        
          // console.log(Results[i].id);
          temp.going = business.totalGoing;
        } else {
          //temp.going = 0;
        }
        return temp;
      })
    })*/

    /*for (let i = 0; i < Results.length; i++) {
      Business.findOne({'id': Results[i].id}, function (err, business) {
        if (business) {
          //let tg = business.totalGoing;        
          console.log(Results[i].id);
          Results[i]["going"] = business.totalGoing;
        } else {
          Results[i]["going"] = 0;
        }
      })
    }*/





// Toggle if user is going
app.get('/api/togglegoing/:id', authCheck, urlEncodedParser, function (req, res) {
  // Search MongoDB for business
  Business.findOne({'id': req.params.id}, function (err, biz) {
    // If business not found, create it
    if (biz === null) {
      Business.create({id: req.params.id, going: [req.user.id], totalGoing: 1}).then((newBusiness) => {
        console.log('Business created');
        res.send('success');
      })
    } 
    // If business found,
    if (biz) {
      // Search for user in the 'going' array
      let foundUser = biz.going.find(function(e) {
        return e === String(req.user._id);
      })
      // Then, if user is found, change their status to 'not going' by removing them from the business's going' array
      if (foundUser !== undefined) {        
        let userIndex = biz.going.indexOf(req.user._id);
        biz.going.splice(userIndex, 1);
        // Update total number of users going to the business
        biz.totalGoing = biz.going.length;
        // Save business document
        biz.save();
      // Or, if user is not found, change their status to 'going' by adding them to the business's 'going' array
      } else {
        biz.going.push(String(req.user._id));
        // Update total number of users going to the business
        biz.totalGoing = biz.going.length;
        // Save business document
        biz.save();
      }

      res.send('Going button click server side completed');
    }
  })
  .then(() => {

  })
})



// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => console.log(`Express listening on port ${PORT}`))