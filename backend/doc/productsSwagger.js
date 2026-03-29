/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog, checkout, and order APIs
 */

/**
 * @swagger
 * /api/products/getProducts:
 *   get:
 *     summary: Get the public product catalog
 *     tags: [Products]
 *     security: []
 *     responses:
 *       200:
 *         description: Product catalog returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               products:
 *                 - id: "67f11c8ab8f4472fdd5be201"
 *                   product_name: "Premium Dog Food"
 *                   product_type: "food"
 *                   product_category: "Nutrition"
 *                   variants:
 *                     - variant_id: "67f11c8ab8f4472fdd5be202"
 *                       size: "5kg"
 *                       color: null
 *                       regular_price: 1200
 *                       sale_price: 999
 *                       stock_quantity: 18
 *                   image_data: "https://res.cloudinary.com/demo/image/upload/product-main.jpg"
 *               filters:
 *                 productTypes: ["food", "toy"]
 *                 colors: ["blue", "red"]
 *                 sizes: ["5kg", "large"]
 *                 maxPrice: 1200
 */

/**
 * @swagger
 * /api/products/getProduct/{id}:
 *   get:
 *     summary: Get public product details
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               product:
 *                 id: "67f11c8ab8f4472fdd5be201"
 *                 product_name: "Premium Dog Food"
 *                 product_type: "Food"
 *                 product_category: "Nutrition"
 *                 product_description: "Balanced daily nutrition for adult dogs."
 *                 variants:
 *                   - variant_id: "67f11c8ab8f4472fdd5be202"
 *                     size: "5kg"
 *                     color: null
 *                     regular_price: 1200
 *                     sale_price: 999
 *                     stock_quantity: 18
 *                 image_data: "https://res.cloudinary.com/demo/image/upload/product-main.jpg"
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /api/products/checkout:
 *   post:
 *     summary: Start checkout for the current customer
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cart, selectedAddress]
 *             properties:
 *               cart:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     variant_id:
 *                       type: string
 *                     product_name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *                     size:
 *                       type: string
 *                     color:
 *                       type: string
 *               selectedAddress:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   houseNumber:
 *                     type: string
 *                   streetNo:
 *                     type: string
 *                   city:
 *                     type: string
 *                   pincode:
 *                     type: string
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               redirectUrl: "/payment"
 *       400:
 *         description: Invalid cart or shipping address
 */

/**
 * @swagger
 * /api/products/create-payment-intent:
 *   post:
 *     summary: Create or reuse a Stripe payment intent for the active product checkout session
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stripe payment intent is ready
 *         content:
 *           application/json:
 *             examples:
 *               freshIntent:
 *                 value:
 *                   success: true
 *                   clientSecret: "pi_3N..._secret_..."
 *               alreadyPaid:
 *                 value:
 *                   success: true
 *                   paymentCompleted: true
 *                   paymentIntentId: "pi_3N..."
 *       400:
 *         description: Checkout session is missing or invalid
 *       403:
 *         description: Checkout session does not belong to the signed-in user
 *       500:
 *         description: Stripe is not configured
 */

/**
 * @swagger
 * /api/products/process-payment:
 *   post:
 *     summary: Complete payment for the active checkout session
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentIntentId]
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               redirectUrl: "/my_orders"
 *       400:
 *         description: Missing payment intent or payment verification failed
 *       403:
 *         description: Checkout session does not belong to the signed-in user
 */

/**
 * @swagger
 * /api/products/getUserOrders:
 *   get:
 *     summary: Get orders for the current customer
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User orders returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               orders:
 *                 - _id: "67f11c8ab8f4472fdd5be301"
 *                   status: "Pending"
 *                   total_amount: 1038.96
 *                   order_date: "2026-03-30T10:30:00.000Z"
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
 *         description: Reorder completed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Order placed successfully"
 *               orderId: "67f11c8ab8f4472fdd5be401"
 *       404:
 *         description: Order not found
 */
