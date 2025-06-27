// middleware/validationMiddleware.js
import { body } from 'express-validator';

// Common validation rules
export const registerValidation = [
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .isIn(['tutor', 'parent'])
    .withMessage('Role must be either tutor or parent')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password must be less than 128 characters')
];

export const refreshTokenValidation = [
  body('token')
    .notEmpty()
    .withMessage('Token is required')
    .isJWT()
    .withMessage('Invalid token format')
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

export const resetPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
];

export const resetPasswordConfirmValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];