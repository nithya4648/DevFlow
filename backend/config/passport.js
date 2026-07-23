const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "placeholder_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder_client_secret",
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
          return done(new Error("No email found from Google"), null);
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // If user exists but doesn't have a googleId, link it
          if (!user.googleId) {
            user.googleId = profile.id;
            user.isVerified = true; // Google emails are verified
            await user.save();
          }
          return done(null, user);
        } else {
          // Create new user
          const newUser = await User.create({
            name: profile.displayName,
            email: email,
            googleId: profile.id,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : "",
            isVerified: true,
            // Skip password because googleId exists (handled in schema)
          });

          // Create welcome notification
          const Notification = require("../models/Notification.model");
          const { emitNotificationToUser } = require("../utils/socketService");
          
          const welcomeNote = await Notification.create({
            recipient: newUser._id,
            type: "success",
            message: `Welcome to DevFlow, ${newUser.name}! 🚀 Explore your new developer dashboard.`,
          });
          
          // emit is best effort since they haven't connected yet, but good to have
          emitNotificationToUser(null, newUser._id, welcomeNote);

          return done(null, newUser);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
