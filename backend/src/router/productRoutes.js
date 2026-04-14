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
router.get('/getProducts', getPetAccessories);
router.get('/getProduct/:id', getProduct);
router.post('/checkout', protectRoute(['customer']), checkout);
router.post('/create-payment-intent', protectRoute(['customer']), createProductPaymentIntent);
router.post('/process-payment', protectRoute(['customer']), processPayment);
router.get('/getUserOrders', protectRoute(['customer']), getUserOrders);
router.post('/orders/:orderId/reorder', protectRoute(['customer']), reorder);
router.get('/getProductWithRatings/:id', getProductWithRatings);
export default router;