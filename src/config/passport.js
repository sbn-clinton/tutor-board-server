// config/passport.js

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import TutorSchema from '../models/TutorSchema.js';
import ParentSchema from '../models/ParentSchema.js';

dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    let user = await TutorSchema.findById(id).select('-password');
    if (!user) {
      user = await ParentSchema.findById(id).select('-password');
    }

    if (!user) {
      return done(null, false, { message: 'User not found' });
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      // Try to find user in both collections
      let user = await TutorSchema.findOne({ email });
      if (!user) {
        user = await ParentSchema.findOne({ email });
      }

      if (!user) {
        return done(null, false, { message: 'Incorrect email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect email or password' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);




passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let tutor = await TutorSchema.findOne({ googleId: profile.id });
    let parent = await ParentSchema.findOne({ googleId: profile.id });
    let user = tutor || parent;

    if (!user) {
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        password: 'GOOGLE_AUTH',
      });
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

