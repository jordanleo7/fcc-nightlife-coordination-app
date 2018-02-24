const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: String,
  googleId: String,
  businesses: Array
});

const User = mongoose.model('nightlife_coordination_app_user', userSchema);

module.exports = User;