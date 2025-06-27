// utils/jwtUtils.js
import jwt from 'jsonwebtoken';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRE || '24h' 
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' 
  });
};

export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

// Optional: Token blacklist utilities (if you want to implement logout blacklisting)
const tokenBlacklist = new Set();

export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// Optional: Clean expired tokens from blacklist periodically
export const cleanBlacklist = () => {
  // This is a simple implementation. In production, you might want to use Redis
  // or a database to store blacklisted tokens with expiration times
  tokenBlacklist.clear();
};