import express from 'express';
import { submitReview, getReviewDetails } from '../controller/reviewController.js';
import  protectRoute  from '../middleware/authMiddleware.js';

const router = express.Router();

// Require user to be logged in as a customer
router.get('/:ticketId/:token', protectRoute(['customer']), getReviewDetails);
router.post('/:ticketId/:token', protectRoute(['customer']), submitReview);

export default router;