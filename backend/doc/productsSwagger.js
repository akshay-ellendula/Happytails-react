
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


