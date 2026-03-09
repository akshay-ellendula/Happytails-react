
/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management APIs
 */

/**
 * @swagger
 * /api/events/public:
 *   get:
 *     summary: Get all public events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of all events
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get events created by event manager
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager events
 *
 *   post:
 *     summary: Create new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               language:
 *                 type: string
 *               duration:
 *                 type: string
 *               ageLimit:
 *                 type: string
 *               ticketPrice:
 *                 type: number
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *               venue:
 *                 type: string
 *               location:
 *                 type: string
 *               total_tickets:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Event created successfully
 */

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event details
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event updated
 *
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event deleted
 */

/**
 * @swagger
 * /api/events/{id}/eventAnalytics:
 *   get:
 *     summary: Get analytics for an event
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
 *         description: Event analytics data
 */
