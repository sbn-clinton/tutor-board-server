// controllers/authController.js
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import TutorSchema from '../models/TutorSchema.js';
import ParentSchema from '../models/ParentSchema.js';
import { generateAccessToken } from '../utils/jwtUtils.js';

export const tutorRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, role } = req.body;

  try {
    let user = await TutorSchema.findOne({ email }).select('-password');
    if (user) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new TutorSchema({ fullName, email, password: hashedPassword, role });
    await user.save();

    // Generate token for auto-login after registration
    const token = generateAccessToken({ 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({ 
      message: 'Tutor registered successfully',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Tutor registration error:', err);
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
    let user = await ParentSchema.findOne({ email }).select('-password');
    if (user) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new ParentSchema({ fullName, email, password: hashedPassword, role });
    await user.save();

    // Generate token for auto-login after registration
    const token = generateAccessToken({ 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({ 
      message: 'Parent registered successfully',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Parent registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Try to find user in both collections
    let user = await TutorSchema.findOne({ email });
    if (!user) {
      user = await ParentSchema.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // Generate token
    const token = generateAccessToken({ 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    req.user = userResponse;

    return res.status(200).json({ 
      message: 'Login successful', 
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getLogout = (req, res) => {
  // Destroy session from MongoDB
  req.session.destroy(err => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ message: 'Failed to logout. Please try again.' });
    }

    // Clear session cookie
    res.clearCookie('connect.sid', {
      path: '/', // make sure this matches your session cookie path
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
    });

    return res.status(200).json({
      message: 'Logged out successfully. Session cleared.',
    });
  });
};


export const getCurrentUser = async (req, res) => {
  try {
    // User info is already available from the auth middleware
    return res.status(200).json({ 
      message: 'User data retrieved successfully',
      user: req.user 
    });
  } catch (err) {
    console.error('Get current user error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    
    // Find user to ensure they still exist
    let user = await TutorSchema.findById(decoded.id).select('-password');
    if (!user) {
      user = await ParentSchema.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new token
    const newToken = generateAccessToken({ 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });

    return res.status(200).json({ 
      message: 'Token refreshed successfully',
      token: newToken,
      user 
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.error('Refresh token error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};