import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import cacheMiddleware from '../middleware/cacheMiddleware.js';
import {
    getDashboardAnalytics,
    getRevenueTrends,
    getEventTypeDistribution,
    getAttendanceAnalytics,
    getPlatformFeeBreakdown,
    getPerformanceMetrics
} from '../controller/eventAnalyticsController.js';

const router = express.Router();

// Event Manager analytics — cached 30s (near-real-time but protects DB from dashboard refreshes)
router.get('/dashboard', protectRoute(['eventManager']), cacheMiddleware(30), getDashboardAnalytics);
router.get('/revenue-trends', protectRoute(['eventManager']), cacheMiddleware(30), getRevenueTrends);
router.get('/event-types', protectRoute(['eventManager']), cacheMiddleware(60), getEventTypeDistribution);
router.get('/attendance', protectRoute(['eventManager']), cacheMiddleware(30), getAttendanceAnalytics);
router.get('/platform-fees', protectRoute(['eventManager']), cacheMiddleware(60), getPlatformFeeBreakdown);
router.get('/performance-metrics', protectRoute(['eventManager']), cacheMiddleware(30), getPerformanceMetrics);

export default router;