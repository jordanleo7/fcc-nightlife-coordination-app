const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	username: String,
  googleId: String,
  lastSearch: String
});

const User = mongoose.model('nightlife_coordination_app_user', UserSchema);

module.exports = {
  UserSchema,
  User
};