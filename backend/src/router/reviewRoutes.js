import express from 'express';
import { submitReview, getReviewDetails, getEventManagerReviews, getEventReviews, getEventManagerAnalytics } from '../controller/reviewController.js';
import  protectRoute  from '../middleware/authMiddleware.js';

const router = express.Router();

// New route for Event Managers to see their reviews
router.get('/manager', protectRoute(['eventManager']), getEventManagerReviews);
router.get('/manager/analytics', protectRoute(['eventManager']), getEventManagerAnalytics);
router.get('/event/:eventId', protectRoute(['eventManager']), getEventReviews);

// Existing routes for customers
router.get('/:ticketId/:token', protectRoute(['customer']), getReviewDetails);
router.post('/:ticketId/:token', protectRoute(['customer']), submitReview);

export default router;