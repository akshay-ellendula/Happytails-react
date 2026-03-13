/**
 * @swagger
 * tags:
 *   name: Vendor
 *   description: Vendor management APIs
 */

/**
 * @swagger
 * /api/vendor/logout:
 *   post:
 *     summary: Logout vendor
 *     tags: [Vendor]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /api/vendor/dashboard:
 *   get:
 *     summary: Get vendor dashboard data
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data returned
 */

/**
 * @swagger
 * /api/vendor/profile:
 *   get:
 *     summary: Get vendor profile
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor profile data
 */

/**
 * @swagger
 * /api/vendor/profile:
 *   put:
 *     summary: Update vendor profile
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */

/**
 * @swagger
 * /api/vendor/change-password:
 *   put:
 *     summary: Change vendor password
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password updated
 */

/**
 * @swagger
 * /api/vendor/analytics:
 *   get:
 *     summary: Get vendor analytics
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */

/**
 * @swagger
 * /api/vendor/products:
 *   get:
 *     summary: Get vendor products
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product list
 */

/**
 * @swagger
 * /api/vendor/products:
 *   post:
 *     summary: Add new product
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               product_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created
 */

/**
 * @swagger
 * /api/vendor/products/top3:
 *   get:
 *     summary: Get top 3 selling products for vendor
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top 3 products returned
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               maxItems: 3
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                   totalSold:
 *                     type: number
 */

/**
 * @swagger
 * /api/vendor/products/all-sorted:
 *   get:
 *     summary: Get all vendor products sorted
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, name, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Sorted product list returned
 */

/**
 * @swagger
 * /api/vendor/products/{productId}:
 *   get:
 *     summary: Get product details for editing
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product
 *     responses:
 *       200:
 *         description: Product data
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /api/vendor/products/{productId}:
 *   put:
 *     summary: Update product
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to update
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               product_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /api/vendor/products/{productId}:
 *   delete:
 *     summary: Delete product
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /api/vendor/orders:
 *   get:
 *     summary: Get all vendor orders
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders list
 */

/**
 * @swagger
 * /api/vendor/orders/{orderId}:
 *   get:
 *     summary: Get order details
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order
 *     responses:
 *       200:
 *         description: Order details returned
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/vendor/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/vendor/orders/{orderId}:
 *   delete:
 *     summary: Delete a specific order
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to delete
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/vendor/orders/delete-batch:
 *   post:
 *     summary: Delete multiple orders in batch
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderIds
 *             properties:
 *               orderIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of order IDs to delete
 *     responses:
 *       200:
 *         description: Selected orders deleted successfully
 *       400:
 *         description: Invalid request body
 */

/**
 * @swagger
 * /api/vendor/customers:
 *   get:
 *     summary: Get all vendor customers
 *     tags: [Vendor Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer list
 */

/**
 * @swagger
 * /api/vendor/customers/all-sorted:
 *   get:
 *     summary: Get all vendor customers sorted
 *     tags: [Vendor Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, createdAt, totalOrders]
 *         description: Field to sort customers by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Sorted customer list returned
 */

/**
 * @swagger
 * /api/vendor/customers/{customerId}:
 *   get:
 *     summary: Get details of a specific customer
 *     tags: [Vendor Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the customer
 *     responses:
 *       200:
 *         description: Customer details returned
 *       404:
 *         description: Customer not found
 */