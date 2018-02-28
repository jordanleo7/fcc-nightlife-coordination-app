
const express = require('express');
const router = express.Router();

// Yelp API
const yelp = require('yelp-fusion');
const yelpAPIKey = process.env.YELP_API_KEY;
const client = yelp.client(yelpAPIKey); // return a promise

const Business = require('./models/Business');

// authCheck
const authCheck = (req, res, next) => {
  if (req.user) {
    // If logged in
    next();
  } else {
    // If user is not logged in
    res.redirect('/');
  }
};

//
// User searches for businesses by location. Server returns list of businesses from Yelp API with number of users going to said businesses taken from MongoDB
//
router.get('/api/yelp/search/:id', async (req, res) => {
  // Declare Yelp search parameters
  const searchRequest = {
    location: req.params.id,
    categories: 'Nightlife'
  };
  // Perform Yelp search request
  const yelpResponse = await client.search(searchRequest).catch(console.error);
  // If no search results found, return now (Reminder to later add React 'No results found' type message in place of search results list). Have not verified Yelp would return 0 or error
  if (yelpResponse.jsonBody.total === 0) {
    console.log('No search results found'); 
    return res.statusCode(204).end();
  }
  // Take the array of business objects out of the yelpResponse
  const yelpBusinesses = yelpResponse.jsonBody.businesses;
  // Search MongoDB Business collection for businesses that match yelpResponse businesses, by id (not _id)
  const combinedResults = await Promise.all(yelpBusinesses.map(async (yelpBusiness) => {
    let business;
    try {
      business = await Business.findOne({ yelpId: yelpBusiness.id });
    }
    catch(error) {
      console.log(error);
    }
    finally {
      const numberGoing = business ? business.going.length : 0;
      return { ...yelpBusiness, numberGoing };
    }

  }));

  console.log(combinedResults);
  res.send(combinedResults);

})

//
// Toggle if user is going
//
router.post('/api/togglegoing/:id', authCheck, function (req, res) {
  // Search MongoDB for business
  Business.findOne({yelpId: req.params.id}, function (err, business) {
    // If business not found, create it
    if (business === null) {
      Business.create({yelpId: req.params.id, going: [req.user.id]}).then((newBusiness) => {
        console.log('Business created');
        res.send(newBusiness);
      })
    } 
    // If business found,
    if (business) {
      // Search for logged in user in the 'going' array
      let findUser = business.going.find(function(e) {
        return e === String(req.user._id);
      })
      // Then, if user is found, change their status to 'not going' by removing them from the business's going' array
      if (findUser !== undefined) {        
        let userIndex = business.going.indexOf(req.user._id);
        business.going.splice(userIndex, 1);
        // Save business document
        business.save();
      // Or, if user is not found, change their status to 'going' by adding them to the business's 'going' array
      } else {
        business.going.push(String(req.user._id)); // Add String so it doesn't save user _id as the 'going' as oid/_id 
        // Save business document
        business.save();
      }

      console.log(String(business.going.length));
      res.send(String(business.going.length));
    }
  })
  .then(() => {

  })
})



module.exports = router;