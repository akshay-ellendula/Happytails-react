import express from 'express';

const router = express.Router();
import {
    getPetAccessories,
    getProduct,
    checkout,
    createProductPaymentIntent,
    getUserOrders,
    processPayment,
    getProductWithRatings,
    reorder,
} from '../controller/productController.js';

import protectRoute from '../middleware/authMiddleware.js';
import cacheMiddleware from '../middleware/cacheMiddleware.js';

// Public browsing routes — cached for fast storefront loading
router.get('/getProducts', cacheMiddleware(120), getPetAccessories);          // Product listing (heavy aggregation) — 2 min cache
router.get('/getProduct/:id', cacheMiddleware(60), getProduct);               // Single product details — 1 min cache
router.get('/getProductWithRatings/:id', cacheMiddleware(60), getProductWithRatings); // Product + ratings — 1 min cache

// Authenticated routes — not cached (user-specific / mutation)
router.post('/checkout', protectRoute(['customer']), checkout);
router.post('/create-payment-intent', protectRoute(['customer']), createProductPaymentIntent);
router.post('/process-payment', protectRoute(['customer']), processPayment);
router.get('/getUserOrders', protectRoute(['customer']), getUserOrders);
router.post('/orders/:orderId/reorder', protectRoute(['customer']), reorder);

export default router;