/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Event reviews by customers and management by Event Managers
 */

/**
 * @swagger
 * /api/review/manager:
 *   get:
 *     summary: Get all reviews for current event manager
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reviews
 * 
 * /api/review/manager/analytics:
 *   get:
 *     summary: Get review analytics for current event manager
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Review analytics
 * 
 * /api/review/event/{eventId}:
 *   get:
 *     summary: Get reviews for a specific event
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews
 * 
 * /api/review/{ticketId}/{token}:
 *   get:
 *     summary: Get review details by ticket and token
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *   post:
 *     summary: Submit a review for a ticket using a token
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: token
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
 *               reviewText:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review submitted successfully
 */
