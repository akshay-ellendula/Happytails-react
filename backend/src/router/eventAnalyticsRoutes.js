import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';

import {
  getDashboardAnalytics,
  getRevenueTrends,
  getEventTypeDistribution,
  getAttendanceAnalytics,
  getPlatformFeeBreakdown,
  getPerformanceMetrics
} from '../controller/eventAnalyticsController.js';

const router = express.Router();

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
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 */
router.get('/dashboard', protectRoute(['eventManager']), getDashboardAnalytics);

/**
 * @swagger
 * /api/eventAnalytics/revenue-trends:
 *   get:
 *     summary: Get revenue trends over time
 *     tags: [Event Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue trend data
 */
router.get('/revenue-trends', protectRoute(['eventManager']), getRevenueTrends);

/**
 * @swagger
 * /api/eventAnalytics/event-types:
 *   get:
 *     summary: Get event type distribution
 *     tags: [Event Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event category distribution
 */
router.get('/event-types', protectRoute(['eventManager']), getEventTypeDistribution);

/**
 * @swagger
 * /api/eventAnalytics/attendance:
 *   get:
 *     summary: Get attendance analytics
 *     tags: [Event Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance statistics
 */
router.get('/attendance', protectRoute(['eventManager']), getAttendanceAnalytics);

/**
 * @swagger
 * /api/eventAnalytics/platform-fees:
 *   get:
 *     summary: Get platform fee breakdown
 *     tags: [Event Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform fee analytics
 */
router.get('/platform-fees', protectRoute(['eventManager']), getPlatformFeeBreakdown);

/**
 * @swagger
 * /api/eventAnalytics/performance-metrics:
 *   get:
 *     summary: Get performance metrics
 *     tags: [Event Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance metrics data
 */
router.get('/performance-metrics', protectRoute(['eventManager']), getPerformanceMetrics);

export default router;
