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

router.get('/dashboard', protectRoute(['eventManager']), getDashboardAnalytics);
router.get('/revenue-trends', protectRoute(['eventManager']), getRevenueTrends);
router.get('/event-types', protectRoute(['eventManager']), getEventTypeDistribution);
router.get('/attendance', protectRoute(['eventManager']), getAttendanceAnalytics);
router.get('/platform-fees', protectRoute(['eventManager']), getPlatformFeeBreakdown);
router.get('/performance-metrics', protectRoute(['eventManager']), getPerformanceMetrics);

export default router;