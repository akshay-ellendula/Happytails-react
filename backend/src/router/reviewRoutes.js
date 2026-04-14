import express from 'express';
import { submitReview, getReviewDetails, getEventManagerReviews } from '../controller/reviewController.js';
import  protectRoute  from '../middleware/authMiddleware.js';

const router = express.Router();

// New route for Event Managers to see their reviews
router.get('/manager', protectRoute(['eventManager']), getEventManagerReviews);

// Existing routes for customers
router.get('/:ticketId/:token', protectRoute(['customer']), getReviewDetails);
router.post('/:ticketId/:token', protectRoute(['customer']), submitReview);

export default router;