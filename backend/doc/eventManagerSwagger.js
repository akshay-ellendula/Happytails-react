
/**
 * @swagger
 * tags:
 *   name: EventManagers
 *   description: Event manager management APIs
 */

/**
 * @swagger
 * /api/eventManagers/profile/me:
 *   get:
 *     summary: Get logged-in event manager profile
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager profile
 */

/**
 * @swagger
 * /api/eventManagers/profile/me:
 *   put:
 *     summary: Update event manager profile
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               companyName:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */


/**
 * @swagger
 * /api/eventManagers/change-password:
 *   put:
 *     summary: Change event manager password
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password changed successfully
 */

/**
 * @swagger
 * /api/eventManagers/events/attendees:
 *   get:
 *     summary: Get attendees for all events
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendee list
 */


/**
 * @swagger
 * /api/eventManagers/events/attendees/{id}:
 *   get:
 *     summary: Get attendees for a specific event
 *     tags: [EventManagers]
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
 *         description: Event attendees
 */

/**
 * @swagger
 * /api/eventManagers/events/my-events:
 *   get:
 *     summary: Get events created by event manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 */

/**
 * @swagger
 * /api/eventManagers/revenue/my-revenue:
 *   get:
 *     summary: Get revenue for event manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue details
 */


/**
 * @swagger
 * /api/eventManagers/changeStatus/{id}:
 *   put:
 *     summary: Change event manager active status
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /api/eventManagers:
 *   get:
 *     summary: Get all event managers (Admin)
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of event managers
 */

/**
 * @swagger
 * /api/eventManagers/{id}:
 *   get:
 *     summary: Get event manager by ID
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager details
 *
 *   put:
 *     summary: Update event manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager updated
 *
 *   delete:
 *     summary: Delete event manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager deleted
 */

/**
 * @swagger
 * /api/eventManagers/events/{eventId}/details:
 *   get:
 *     summary: Get event details for manager
 *     tags: [EventManagers]
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
 *         description: Event details
 */
;