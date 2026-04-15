/**
 * @swagger
 * /api/events/{id}/cancel:
 *   put:
 *     summary: Cancel an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event cancelled successfully
 * 
 * /api/products/getProductWithRatings/{id}:
 *   get:
 *     summary: Get a product along with its ratings
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product and ratings retrieved
 * 
 * /api/vendors/products/ratings:
 *   get:
 *     summary: Get vendor products ratings
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ratings retrieved
 *
 * /api/vendors/orders/{orderId}/notes:
 *   post:
 *     summary: Add notes to an order
 *     tags: [Vendors]
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
 *         description: Note added
 *
 * /api/vendors/orders/batch-status:
 *   post:
 *     summary: Update order status in batch
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Updated successfully
 *
 * /api/vendors/products/{productId}/stock:
 *   put:
 *     summary: Update product stock
 *     tags: [Vendors]
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
 *         description: Stock updated
 *
 * /api/vendors/products/bulk-upload:
 *   post:
 *     summary: Bulk upload products
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Uploaded successfully
 */
