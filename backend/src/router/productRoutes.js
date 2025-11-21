import express from 'express';
console.log("--- Product routes file loaded ---");
const router = express.Router();
import { 
    getPetAccessories, 
    getProduct, 
    checkout,           
    getUserOrders,
    processPayment,   
    reorder,         
} from '../controller/productController.js'; // Corrected folder path to '../controllers' and added .js

import protectRoute from '../middleware/authMiddleware.js';
router.get('/getProducts', getPetAccessories);
// Endpoint: GET /api/products/getProduct/:id
router.get('/getProduct/:id', getProduct);
// Endpoint: POST /api/products/checkout 
router.post('/checkout', protectRoute(['customer']), checkout);
// Endpoint: POST /api/products/process-payment
router.post('/process-payment', protectRoute(['customer']), processPayment); 
// Endpoint: GET /api/products/my_orders
router.get('/getUserOrders', protectRoute(['customer']), getUserOrders);
// Endpoint: POST /api/products/orders/:orderId/reorder
router.post('/orders/:orderId/reorder', protectRoute(['customer']), reorder);
export default router;