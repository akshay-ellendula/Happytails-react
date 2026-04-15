import express from 'express';
import {
    createRating,
    getProductRatings,
    getUserProductRatings,
    updateRating,
    deleteRating,
    markHelpful,
    getProductRatingSummary
} from '../controller/ratingController.js';
import protectRoute from '../middleware/authMiddleware.js';
import cacheMiddleware from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Customer routes (authenticated, no cache — user-specific)
router.post('/create', protectRoute(['customer']), createRating);
router.get('/my-ratings', protectRoute(['customer']), getUserProductRatings);
router.put('/:ratingId', protectRoute(['customer']), updateRating);
router.delete('/:ratingId', protectRoute(['customer']), deleteRating);
router.post('/:ratingId/helpful', protectRoute(['customer']), markHelpful);

// Public routes — cached for fast product page loading
router.get('/product/:productId/summary', cacheMiddleware(300), getProductRatingSummary); // Rating summary — 5 min cache
router.get('/product/:productId', cacheMiddleware(120), getProductRatings);               // Full ratings — 2 min cache

export default router;