const mongoose = require('mongoose');
const User = require('./User');

/**
 * what is imported from the User.js file is what is exported from that file
 * 
 * 
 * 
module.exports = {
  userSchema,
  User,
};
 * 
 * using object deconstruction to import a specific field from the exported object
 * const { userSchema } = require('./User'); // equivalent to User.userSchema
 */

const Schema = mongoose.Schema;

// Create Schema
const BusinessSchema = new Schema({
  yelpId: String, // conver to yelpId
  going: Array // Figure this out later: [User.UserSchema], // this provides validation that each element in the going array must adhere to the User schema definition that we imported from User.js
  // there is a relationship mechanic within Mongo/Mongoose called "populate" and it uses _id (aka oid, object id) references

  // remove in favor of going.length 
  // totalGoing: Number // replace in route handler by returning going.length in place of totalGoing
});

// Create model
const Business = mongoose.model('nightlife_coordination_app_business', BusinessSchema);

module.exports = Business;