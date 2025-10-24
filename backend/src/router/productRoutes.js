// productRoutes.js

import express from 'express';
const router = express.Router();
import { 
    getPetAccessories, 
    getProduct, 
    checkout,           
    getUserOrders,
    processPayment,   
    reorder,
    getPaymentPage           
} from '../controller/productController.js'; // Corrected folder path to '../controllers' and added .js

import protectRoute from '../middleware/authMiddleware.js';
// --- PUBLIC PRODUCT/FILTER ENDPOINTS (GET data for React components) ---

// Endpoint: GET /api/products/pet_accessory
router.get('/pet_accessory', getPetAccessories);

// Endpoint: GET /api/products/product/:id
router.get('/product/:id', getProduct);


// --- AUTHENTICATED CHECKOUT/ORDER ENDPOINTS ---

// Endpoint: POST /api/products/checkout
router.post('/checkout', protectRoute(['customer']), checkout);

// Endpoint: POST /api/products/process-payment
router.post('/process-payment', protectRoute(['customer']), processPayment); 

// Endpoint: GET /api/products/payment (Used for legacy EJS redirect)
router.get('/payment', getPaymentPage);

// Endpoint: GET /api/products/my_orders
router.get('/my_orders', protectRoute(['customer']), getUserOrders);

// Endpoint: POST /api/products/orders/:orderId/reorder
router.post('/orders/:orderId/reorder', protectRoute(['customer']), reorder);

export default router;