// routes/authRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { 
  tutorRegister, 
  parentRegister, 
  postLogin, 
  getLogout, 
  getCurrentUser, 
  refreshToken 
} from '../controllers/authControllers.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
    // .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    // .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .isIn(['tutor', 'parent'])
    .withMessage('Role must be either tutor or parent')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const refreshTokenValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token is required')
];

// Public routes
router.post('/tutor-register', registerValidation, tutorRegister);
router.post('/parent-register', registerValidation, parentRegister);
router.post('/login', loginValidation, postLogin);
router.post('/logout', getLogout);
router.post('/refresh', refreshTokenValidation, refreshToken);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);


export default router;
