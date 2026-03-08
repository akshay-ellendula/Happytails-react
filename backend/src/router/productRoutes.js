import express from 'express';
import {
  getPetAccessories,
  getProduct,
  checkout,
  getUserOrders,
  processPayment,
  reorder,
} from '../controller/productController.js';

import protectRoute from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         vendor_id:
 *           type: string
 *         product_name:
 *           type: string
 *         product_category:
 *           type: string
 *         product_type:
 *           type: string
 *         product_description:
 *           type: string
 *         sku:
 *           type: string
 *         stock_status:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         is_deleted:
 *           type: boolean
 *       example:
 *         _id: "6650abf1"
 *         vendor_id: "664fa234"
 *         product_name: "Dog Food Premium"
 *         product_category: "Food"
 *         product_type: "Dry Food"
 *         product_description: "Healthy dog food"
 *         sku: "DOG-FOOD-001"
 *         stock_status: "In Stock"
 *
 *     ProductVariant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         product_id:
 *           type: string
 *         size:
 *           type: string
 *         color:
 *           type: string
 *         regular_price:
 *           type: number
 *         sale_price:
 *           type: number
 *         stock_quantity:
 *           type: number
 *
 *     ProductImage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         product_id:
 *           type: string
 *         image_data:
 *           type: string
 *         is_primary:
 *           type: boolean
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product and order APIs
 */

/**
 * @swagger
 * /api/products/getProducts:
 *   get:
 *     summary: Get all pet accessories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/getProducts', getPetAccessories);

/**
 * @swagger
 * /api/products/getProduct/{id}:
 *   get:
 *     summary: Get single product details
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/getProduct/:id', getProduct);

/**
 * @swagger
 * /api/products/checkout:
 *   post:
 *     summary: Checkout products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               totalAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Checkout successful
 */
router.post('/checkout', protectRoute(['customer']), checkout);

/**
 * @swagger
 * /api/products/process-payment:
 *   post:
 *     summary: Process payment for order
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
router.post('/process-payment', protectRoute(['customer']), processPayment);

/**
 * @swagger
 * /api/products/getUserOrders:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/getUserOrders', protectRoute(['customer']), getUserOrders);

/**
 * @swagger
 * /api/products/orders/{orderId}/reorder:
 *   post:
 *     summary: Reorder a previous order
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order placed again successfully
 */
router.post('/orders/:orderId/reorder', protectRoute(['customer']), reorder);

export default router;

