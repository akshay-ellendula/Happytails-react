
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
 * /api/vendor/products/{productId}:
 *   get:
 *     summary: Get product details
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product data
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
 *     responses:
 *       200:
 *         description: Product updated
 */


/**
 * @swagger
 * /api/vendor/products/{productId}:
 *   delete:
 *     summary: Delete product
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product deleted
 */


/**
 * @swagger
 * /api/vendor/orders:
 *   get:
 *     summary: Get vendor orders
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders list
 */

/**
 * @swagger
 * /api/vendor/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order status updated
 */


/**
 * @swagger
 * /api/vendor/customers:
 *   get:
 *     summary: Get vendor customers
 *     tags: [Vendor Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer list
 */
