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
 *     summary: Get public upcoming events
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public events returned successfully
 *         content:
 *           application/json:
 *             example:
 *               events:
 *                 - _id: "67f11c8ab8f4472fdd5bd101"
 *                   title: "Pet Adoption Camp"
 *                   category: "Pets"
 *                   venue: "City Hall"
 *                   location: "Chennai"
 *                   date_time: "2026-04-01T18:00:00.000Z"
 *                   total_tickets: 100
 *                   tickets_sold: 20
 *                   images:
 *                     thumbnail: "https://res.cloudinary.com/demo/image/upload/event-thumb.jpg"
 *                     banner: "https://res.cloudinary.com/demo/image/upload/event-banner.jpg"
 *               totalPages: 3
 *               currentPage: 1
 *               total: 24
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get events created by the current event manager
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [upcoming, completed]
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event manager events returned successfully
 *         content:
 *           application/json:
 *             example:
 *               events:
 *                 - id: "67f11c8ab8f4472fdd5bd101"
 *                   title: "Pet Adoption Camp"
 *                   category: "Pets"
 *                   venue: "City Hall"
 *                   location: "Chennai"
 *                   date_time: "2026-04-01T18:00:00.000Z"
 *                   total_tickets: 100
 *                   tickets_sold: 20
 *                   soldPercentage: 20
 *                   revenue: 4000
 *                   status: "upcoming"
 *                   images:
 *                     thumbnail: "https://res.cloudinary.com/demo/image/upload/event-thumb.jpg"
 *                     banner: "https://res.cloudinary.com/demo/image/upload/event-banner.jpg"
 *               totalPages: 1
 *               currentPage: 1
 *               total: 1
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, ticketPrice, date_time, total_tickets, venue, location]
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
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Event created successfully"
 *               event:
 *                 _id: "67f11c8ab8f4472fdd5bd101"
 *                 title: "Pet Adoption Camp"
 *                 category: "Pets"
 *                 venue: "City Hall"
 *                 location: "Chennai"
 *                 ticketPrice: 200
 *                 total_tickets: 100
 */

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event
 *     tags: [Events]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *       200:
 *         description: Event updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Event not found
 *   delete:
 *     summary: Delete an event
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
 *         description: Event deleted successfully
 *       400:
 *         description: Event cannot be deleted because it already has tickets
 *       403:
 *         description: Access denied
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/events/{id}/eventAnalytics:
 *   get:
 *     summary: Get analytics for a specific event
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
 *         description: Event analytics returned successfully
 *         content:
 *           application/json:
 *             example:
 *               event:
 *                 title: "Pet Adoption Camp"
 *                 date: "2026-04-01T18:00:00.000Z"
 *                 total_tickets: 100
 *                 tickets_sold: 20
 *                 ticketPrice: 200
 *               revenue:
 *                 total: 4000
 *                 platformFee: 240
 *                 netRevenue: 3760
 *               attendance:
 *                 sold: 20
 *                 capacity: 100
 *                 percentage: 20
 *               tickets:
 *                 total: 20
 *                 active: 18
 *                 used: 2
 *       403:
 *         description: Access denied
 *       404:
 *         description: Event not found
 */
