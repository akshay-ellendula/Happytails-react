
/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management API
 */

/**
 * @swagger
 * /api/tickets/admin/all:
 *   get:
 *     summary: Get all tickets (Admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 */

/**
 * @swagger
 * /api/tickets/admin/{id}:
 *   get:
 *     summary: Get ticket by ID (Admin)
 *     tags: [Tickets]
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
 *         description: Ticket details
 */

/**
 * @swagger
 * /api/tickets/my-tickets:
 *   get:
 *     summary: Get logged-in customer tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User tickets list
 */

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get tickets for event manager
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager tickets
 */

/**
 * @swagger
 * /api/tickets/{id}:
 *   post:
 *     summary: Purchase a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Event ID
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
 *               contactName:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               numberOfTickets:
 *                 type: number
 *               price:
 *                 type: number
 *               petName:
 *                 type: string
 *               petBreed:
 *                 type: string
 *               petAge:
 *                 type: number
 *     responses:
 *       201:
 *         description: Ticket purchased successfully
 */

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket details (Event Manager)
 *     tags: [Tickets]
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
 *         description: Ticket details
 */

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     tags: [Tickets]
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
 *         description: Ticket deleted successfully
 */

