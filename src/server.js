// server.js
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors'; // ✅ Import CORS
import authRoutes from './routes/authRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import parentRoutes from './routes/parentRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import reviewRoutes from './routes/reviewsRoutes.js';
import './config/passport.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();


app.use(cookieParser());
// ✅ Apply CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Adjust as needed
  credentials: true, // Enable cookies/session support
}));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json())

// MongoDB session store
app.use(
  session({
    name: 'connect.sid', // match what your cookies use
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60, // 1 day
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // or 'lax' depending on cross-origin setup
  },
  })
);

// Passport middleware
// app.use(session(sessionConfig)); // before passport!
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reviews', reviewRoutes);


app.get('/', (req, res) => res.status(200).json({ message: 'Server is running' }));

app.get('/api/auth/google/callback', (req, res) =>
  res.status(200).json({ message: 'Google auth' })
);

app.get('/dashboard', (req, res) => res.status(200).json({ message: 'Dashboard' }));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
