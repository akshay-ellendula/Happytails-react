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

const router = express.Router();

// Customer routes
router.post('/create', protectRoute(['customer']), createRating);
router.get('/my-ratings', protectRoute(['customer']), getUserProductRatings);
router.put('/:ratingId', protectRoute(['customer']), updateRating);
router.delete('/:ratingId', protectRoute(['customer']), deleteRating);
router.post('/:ratingId/helpful', protectRoute(['customer']), markHelpful);

// Public routes
router.get('/product/:productId/summary', getProductRatingSummary);
router.get('/product/:productId', getProductRatings);

export default router;