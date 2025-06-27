// middleware/authMiddleware.js
import TutorSchema from '../models/TutorSchema.js';
import ParentSchema from '../models/ParentSchema.js';
import { verifyToken } from '../utils/jwtUtils.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    
    // Find user to ensure they still exist and get fresh data
    let user = await TutorSchema.findById(decoded.id).select('-password');
    if (!user) {
      user = await ParentSchema.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    console.error('Token verification error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Legacy middleware names for backward compatibility
export const ensureAuth = authenticateToken;

export const ensureTutor = async (req, res, next) => {
  // First authenticate the token
  await authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'tutor') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Tutor role required.' });
  });
};

export const ensureParent = async (req, res, next) => {
  // First authenticate the token
  await authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'parent') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Parent role required.' });
  });
};

// Optional: Middleware to check if token is valid but not require it
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without user
  }

  try {
    const decoded = verifyToken(token);
    
    let user = await TutorSchema.findById(decoded.id).select('-password');
    if (!user) {
      user = await ParentSchema.findById(decoded.id).select('-password');
    }

    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Token is invalid, but we don't throw error for optional auth
    console.log('Optional auth failed:', err.message);
  }

  next();
};