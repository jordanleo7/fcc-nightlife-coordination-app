const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const BusinessSchema = new Schema({
  id: String,
  going: Array
})

// Create model
const Business = mongoose.model('nightlife_coordination_app_business', BusinessSchema);

module.exports = Business;