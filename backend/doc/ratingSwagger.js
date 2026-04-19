/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Product ratings and reviews by customers
 */

/**
 * @swagger
 * /api/ratings/create:
 *   post:
 *     summary: Create a product rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               orderId:
 *                 type: string
 *               rating:
 *                 type: number
 *               title:
 *                 type: string
 *               review:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rating created successfully
 * 
 * /api/ratings/my-ratings:
 *   get:
 *     summary: Get logged-in customer's ratings
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ratings
 * 
 * /api/ratings/{ratingId}:
 *   put:
 *     summary: Update a rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               title:
 *                 type: string
 *               review:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rating updated
 *   delete:
 *     summary: Delete a rating
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rating deleted
 * 
 * /api/ratings/{ratingId}/helpful:
 *   post:
 *     summary: Mark a rating as helpful
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated helpful count
 * 
 * /api/ratings/product/{productId}/summary:
 *   get:
 *     summary: Get rating summary for a product
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Summary stats
 * 
 * /api/ratings/product/{productId}:
 *   get:
 *     summary: Get full ratings for a product
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of full ratings
 */
