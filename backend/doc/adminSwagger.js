/**
 * @swagger
 * /api/admin/logout:
 *   get:
 *     summary: Logout admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats fetched
 */

/**
 * @swagger
 * /api/admin/revenue-chart:
 *   get:
 *     summary: Get revenue chart data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue data fetched
 */

/**
 * @swagger
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers list fetched
 */

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   get:
 *     summary: Get customer details
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer fetched successfully
 */

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: John Doe
 *               email: john@example.com
 *     responses:
 *       200:
 *         description: Customer updated successfully
 */

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 */

/**
 * @swagger
 * /api/admin/vendors:
 *   get:
 *     summary: Get vendors
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendors fetched
 */

/**
 * @swagger
 * /api/admin/vendors/{id}:
 *   get:
 *     summary: Get vendor details
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor fetched successfully
 */

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products fetched
 */

/**
 * @swagger
 * /api/admin/products/add:
 *   post:
 *     summary: Add product
 *     tags: [Admin Products]
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
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Product added successfully
 */


/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */

/**
 * @swagger
 * /api/admin/event-managers:
 *   get:
 *     summary: Get event managers
 *     tags: [Admin EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event managers fetched
 */


/**
 * @swagger
 * /api/admin/events:
 *   get:
 *     summary: Get all events
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events fetched
 */


/**
 * @swagger
 * /api/admin/events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 */

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched
 */

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details fetched
 */

