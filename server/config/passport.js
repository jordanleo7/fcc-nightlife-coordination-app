const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/User');

passport.serializeUser((user, done) => {
	done(null, user.id)
});

passport.deserializeUser((id, done) => {
	User.findById(id).then((user) => {
		done(null, user);
	});
});

passport.use(
	new GoogleStrategy({
		// options for the google strategy 
		// process.env.APP_URL + 
		callbackURL: '/auth/google/redirect',
		clientID: process.env.GOOGLE_CLIENT_ID,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET
	}, (accessToken, refreshToken, profile, done) => {
		// passport callback function
		// check if user already exists
		User.findOne({googleId: profile.id}).then((currentUser) => {
			if (currentUser) {
				// If found
				console.log('user is: ', currentUser);
				done(null, currentUser);
			} else {
				// If not, create user
				new User({
					username: profile.displayName,
					googleId: profile.id
				}).save().then((newUser) => {
					console.log('new user created: ' + newUser);
					done(null, newUser);
				});
			}
		})

	})

)