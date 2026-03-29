/**
 * @swagger
 * tags:
 *   name: Event Analytics
 *   description: Analytics APIs for Event Managers
 */

/**
 * @swagger
 * /api/eventAnalytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics overview
 *     tags: [Event Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 *         content:
 *           application/json:
 *             example:
 *               basicStats:
 *                 totalEvents: 12
 *                 totalTicketsSold: 184
 *                 totalRevenue: 36800
 *                 platformFee: 2208
 *                 netRevenue: 34592
 *                 revenueGrowth: 18
 *                 totalAttendees: 184
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/eventAnalytics/revenue-trends:
 *   get:
 *     summary: Get revenue trends over time
 *     tags: [Event Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Revenue trend data
 *         content:
 *           application/json:
 *             example:
 *               - month: "2026-03-01"
 *                 revenue: 1200
 *               - month: "2026-03-08"
 *                 revenue: 1600
 *               - month: "2026-03-15"
 *                 revenue: 900
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/eventAnalytics/event-types:
 *   get:
 *     summary: Get event type distribution
 *     tags: [Event Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Event category distribution
 *         content:
 *           application/json:
 *             example:
 *               - event: "Pets"
 *                 sold: 48
 *                 revenue: 9600
 *               - event: "Wellness"
 *                 sold: 22
 *                 revenue: 4400
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/eventAnalytics/attendance:
 *   get:
 *     summary: Get attendance analytics
 *     tags: [Event Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Attendance statistics
 *         content:
 *           application/json:
 *             example:
 *               - name: "Pet Adoption Camp"
 *                 date: "4/1/2026"
 *                 capacity: 100
 *                 sold: 78
 *                 rate: 78
 *               - name: "Pet Wellness Meetup"
 *                 date: "4/12/2026"
 *                 capacity: 60
 *                 sold: 28
 *                 rate: 47
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/eventAnalytics/platform-fees:
 *   get:
 *     summary: Get platform fee breakdown
 *     tags: [Event Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Platform fee analytics
 *         content:
 *           application/json:
 *             example:
 *               - month: "Mar 2026"
 *                 totalRevenue: 12000
 *                 platformFee: 720
 *                 netRevenue: 11280
 *               - month: "Apr 2026"
 *                 totalRevenue: 9800
 *                 platformFee: 588
 *                 netRevenue: 9212
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/eventAnalytics/performance-metrics:
 *   get:
 *     summary: Get performance metrics
 *     tags: [Event Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Performance metrics data
 *         content:
 *           application/json:
 *             example:
 *               averageTicketPrice: 210.5
 *               customerLifetimeValue: 1260
 *       500:
 *         description: Server error
 */
