import express from 'express';
import { createReview } from '../controllers/reviewsController.js';
import { ensureParent } from '../middleware/authMiddleware.js';


const router = express.Router();

router.post('/add-parent-review',ensureParent, createReview);

export default router;
