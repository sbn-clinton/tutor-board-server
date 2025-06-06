// middleware/authMiddleware.js
export const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};


export const ensureTutor = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'tutor') {
    return next();
  }
  res.status(401).json({ message: 'Not authorized Or Not a Tutor' });
};

export const ensureParent = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'parent') {
    return next();
  }
  res.status(401).json({ message: 'Not authorized Or Not a Parent' });
};