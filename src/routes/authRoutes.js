// routes/authRoutes.js
import express from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import {
  postLogin,
  getLogout,
  // googleAuth,
  googleCallback,
  tutorRegister,
  parentRegister
} from '../controllers/authControllers.js';
import TutorSchema from '../models/TutorSchema.js';
import ParentSchema from '../models/ParentSchema.js';

const router = express.Router();

router.post(
  '/tutor-register',
  [
    body('fullName').notEmpty().withMessage('fullName is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  tutorRegister
);

router.post(
  '/parent-register',
  [
    body('fullName').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  parentRegister
);

router.post('/login', postLogin);

router.post('/logout', getLogout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
}), googleCallback);

router.get("/user/:id", async (req, res) => {
  try {
    const tutor = await TutorSchema.findById(req.params.id).select('-password');
    const parent = await ParentSchema.findById(req.params.id).select('-password');
    const user = tutor || parent;
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
