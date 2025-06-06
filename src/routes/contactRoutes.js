import express from 'express';
import { contactTutor } from '../controllers/contactController.js';
import { ensureParent } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/contact-tutor', ensureParent, contactTutor);

export default router;
