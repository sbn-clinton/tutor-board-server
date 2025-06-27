// config/passport.js

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
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

