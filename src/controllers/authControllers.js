// controllers/authController.js
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import TutorSchema from '../models/TutorSchema.js';
import ParentSchema from '../models/ParentSchema.js';

export const tutorRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, role } = req.body;

  try {
    let user = await TutorSchema.findOne({ email }).select(' -password');
    if (user) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new TutorSchema({ fullName, email, password: hashedPassword, role });
    await user.save();
    return res.status(201).json({ message: 'Tutor registered successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const parentRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, role } = req.body;

  try {
    let user = await ParentSchema.findOne({ email }).select(' -password');
    if (user) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new ParentSchema({ fullName, email, password: hashedPassword, role });
    await user.save();
    return res.status(201).json({ message: 'Parent registered successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({ message: 'Login successful', user });
    });
  })(req, res, next);
};

export const getLogout = (req, res) => {
  console.log("req.session", req.session);
  console.log("req.session.passport", req.session.passport);
  console.log("req.sessionID", req.sessionID);

 
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  });

  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout error', error: err.message });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Session destruction error', error: err.message });
      }

      // ✅ Clear cookie with same options used in session middleware
      res.clearCookie('connect.sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // use 'none' if you're dealing with cross-origin
      });

      return res.status(200).json({ message: 'Logged out successfully and session deleted' });
    });
  });
};



export const googleCallback = (req, res) => {
  res.redirect('/dashboard');
};
