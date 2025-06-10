// server.js
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import reviewRoutes from './routes/reviewsRoutes.js';
import './config/passport.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();


// Middleware
app.use(cookieParser());


// If behind a proxy (Render), trust first proxy
app.set('trust proxy', 1);



// CORS setup
const allowedOrigin = 'https://tutor-board-client.vercel.app';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Handle preflight requests (OPTIONS)
app.options('*', cors({
  origin: allowedOrigin,
  credentials: true,
}));



app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});



app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session config
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === 'production', // always true in production (safe for Vercel + Render)
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // required: 'none' for cross-origin cookies in production
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

app.use((req, res, next) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  console.log('Authenticated:', req.isAuthenticated());
  next();
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);


// Health check route for Render
app.get('/health', (req, res) => res.send('OK'));

// Basic routes
app.get('/', (req, res) => res.status(200).json({ message: 'Server is running' }));
app.get('/api/auth/google/callback', (req, res) =>
  res.status(200).json({ message: 'Google auth' })
);
app.get('/dashboard', (req, res) => res.status(200).json({ message: 'Dashboard' }));

// Start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit process on DB failure
  });
