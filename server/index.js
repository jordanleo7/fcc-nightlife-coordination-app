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
// middleware to parse all incoming requests into JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));

//
// Yelp API
//
const yelp = require('yelp-fusion');
const yelpAPIKey = process.env.YELP_API_KEY;
const client = yelp.client(yelpAPIKey); // return a promise

// query string parameters --> ?key=value&key2=value2 --> { key: value, key2: value2 } (produced through parsing the url)
// dynamic routes 

// User searches for Yelp businesses by location, server returns a list of businesses (from Yelp API) with number of users going to each business (from MongoDB)
app.get('/api/yelp/search/:id', async (req, res) => {
  // Declare Yelp search params
  const searchRequest = {
    location: req.params.id,
    categories: 'Nightlife'
  };
  // Get Yelp search request   const firstResult = response.jsonBody.businesses[0];
  const yelpResponse = await client.search(searchRequest).catch(console.error);
  const body = JSON.parse(yelpResponse.body);
  if (body.total === 0) {console.log(yelpResponse); return res.statusCode(204).end();} // If no results found, remember to add React message to refine search results
  // Now that we have our Yelp response, we want to search MongoDB for all of the businesses' documents
  // search the Business collection for all businesses that match the YelpResponse id
  // businesses = []; if the Business.find() does not find any matches

  // { id: id } -> { id }
  // Object.assign(target, source)

  // conserve database calls (vs conserve loop iterations)
  // const businesses = await Business.find({
  //   id: { $in: yelpResponse.businesses.map((yelpBusinessObject) => {
  //     // MUTATE the yelpBusinessObject data here
      
  //     // look up fast way of stripping multiple fields
  //    return yelpBusinessObject.id; // must return the id of the businessObject for use with $in
  //   }) }
  // }).catch(console.error);
  return res.json(body.businesses.map(async ({id, ...businessObject}) => {
    const business = await Business.findOne({ id }).catch(console.error);
    if (!business) return Object.assign({ id, going: 0 }, businessObject);
    return Object.assign(
      {'going': business.going.length},
      businessObject
    );
    // one db call for each yelp business   <li>Going {this.props.going.length || 0 }</li>
    // if null add going = 0 property to yelp business obj
    // if db business exists combine with yelp business data and return
  }));

  /**
   * 20 x 1000
   * loop over yelpRes.businesses and for each businessObject loop over the dbBusinesses array and find matching ids
   * loop over dbBusinesses and for each business loop over the yelpRes.businesses array and find matching ids
   */

  // accounting at this point: access to database business that match the yelp response as "businesses" (with db data)
  // yelp response businesses (with yelp data) as yelpResponse.businesses


  // finally return JSON array of business objects with [] + [] properties
//           if(business) {
//             yelpBusiness.going = going.length;
//           } else {
//             yelpBusiness.going = 0;
//           }
  /**
   * promises can be handled using then/catch or await [try/catch, promise-catch]
   */
  
  // Add MongoDB number of users going {'going': 1} to the Yelp result


});


/*
data
ok
[{ id: 'dominos-pizza-saint-michael',
[0]     name: 'Domino\'s Pizza',
[0]     image_url: 'https://s3-media3.fl.yelpcdn.com/bphoto/oDsMXSQuME1agZsheUkP3w/o.jpg',
[0]     is_closed: false,
[0]     url: 'https://www.yelp.com/biz/dominos-pizza-saint-michael?adjust_creative=n1AvOrqywXD0f-BUvr7UTQ&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=n1AvOrqywXD0f-BUvr7UTQ',
[0]     review_count: 6,
[0]     categories: [ [Object], [Object], [Object] ],
[0]     rating: 5,
[0]     coordinates: { latitude: 45.2100067, longitude: -93.6630325 },
[0]     transactions: [],
[0]     price: '$',
[0]     location: 
[0]      { address1: '27 Central Ave E',
[0]        address2: '',
[0]        address3: '',
[0]        city: 'Saint Michael',
[0]        zip_code: '55376',
[0]        country: 'US',
[0]        state: 'MN',
[0]        display_address: [Array] },
[0]     phone: '+17634974848',
[0]     display_phone: '(763) 497-4848',
[0]     distance: 627.36804337732,
[0]     going: 0 } ]
*/

/*
// Get Yelp API + MongoDB search results
app.get('/api/yelp/search/:id', urlEncodedParser, async(req, res) => {
  // Yelp search params
  const searchRequest = {
    location: req.params.id,
    categories: 'Nightlife'
  };

  const yelpResponse =  await client.search(searchRequest);
  const searchResults = yelpResponse.jsonBody.businesses;

  const parsedResults = await Promise.all(searchResults.map(async (searchResult) => {
    let business;
    try { 
      business = await Business.findOne({ id: searchResult.id });
    }
    catch(error) {
      business = null;
    }
    finally {
      const going = business ? business.totalGoing : 0;
      return Object.assign({going}, searchResult)
      return { ...searchResult, going };
      yelpBusiness.going = business.totalGoing;
    }
}));

  console.log(parsedResults);
  res.send(parsedResults);
});
*/

// // Get Yelp API + MongoDB search results
// app.get('/api/yelp/search/:id', urlEncodedParser, (req, res) => {
//   // Yelp search params
//   const searchRequest = {
//     location: req.params.id,
//     categories: 'Nightlife'
//   };

//   client.search(searchRequest).then(yelpResponse => {
//     const searchResults = yelpResponse.jsonBody.businesses;

//     return searchResults.map(yelpBusiness => {
//       return new Promise((resolve, reject) => {
//         Business.findOne({ id: yelpBusiness.id }).then(mongoBusiness => {
//           return mongoBusiness;
//         }).catch(() => {
//           return null;
//         }).then((business) => {
//           if(business) {
//             yelpBusiness.going = business.totalGoing;
//           } else {
//             yelpBusiness.going = 0;
//           }
//           resolve(yelpBusiness);
//         })
//       })
//     });

//   }).then(pendingParsedResults => {
//     // return a single promise with the array of values. resolves when all the passed promises resolve.
//     return Promise.all(pendingParsedResults);
//   }).
//   then(parsedResults => {
//     console.log(parsedResults);
//     res.send(parsedResults);
//   });
// });

/*
// Get Yelp API + MongoDB search results
app.get('/api/yelp/search/:id', urlEncodedParser, function (req, res) {
  // Yelp search params
  const searchRequest = {
    location: req.params.id,
    categories: 'Nightlife'
  };
  // Search yelp
  client.search(searchRequest)
  .then(response => {
    // Yelp search results
    let searchResults = response.jsonBody.businesses;
    // Need to Check MongoDB for number of users going to each business
    let promise1 = new Promise(function(resolve, reject) {
      // Prevent res.send until promiseCounter = 20
      let promiseCounter = 0;
      // Loop through busineses
      searchResults.map((result, index) => {
        // Check MongoDB for Yelp business
        Business.findOne({'id': result.id}, function (business) {
          // If business found in MongoDB, add totalGoing count to Yelp results, otherwise add {'going': 0}
          if (business) {
            addTotalGoing(index, business.totalGoing);
            //searchResults[index]["going"] = business.totalGoing;
          } else {
            addTotalGoing(index, 0);
            //searchResults[index]["going"] = 0;
          }
        })
      }).then(() => {console.log('.then worked')})

      function addTotalGoing(index, totalGoing) {
        searchResults[index]["going"] = totalGoing
        promiseCounter +=1;
      }
      // Once each Yelp result has a 'going' value, resolve promise
      resolve(promiseCounter == searchResults.length);
    });
    // Send Yelp results with MongoDB 'going' key added to client
    promise1.then(function(value) {
      console.log(searchResults);
      res.send(searchResults);
      console.log(value);
    });

  })
  .catch(e => {console.log(e);});
}) 
*/


// Toggle if user is going
app.get('/api/togglegoing/:id', authCheck, function (req, res) {
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

      res.send('Going button click, server side completed');
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