import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import cacheMiddleware from '../middleware/cacheMiddleware.js';
import { invalidateCache } from '../middleware/cacheMiddleware.js';
import {
    createEvent,
    getEventManagerEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    getEventAnalytics,
    getAllEvents,cancelEvent,
    sendPromotionalEmail
} from '../controller/eventController.js';

const router = express.Router();

// Public browsing routes — cached for fast event discovery
router.get('/public', cacheMiddleware(60), getAllEvents);          // Event listings — 1 min cache

router.post('/promotions/send', protectRoute(['eventManager']), sendPromotionalEmail);

// Named route MUST be above /:id to prevent "my-events" being cast as ObjectId
router.get('/my-events', protectRoute(['eventManager']), getEventManagerEvents);

router.route('/')
    .post(protectRoute(['eventManager']), upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]), createEvent)
    .get(protectRoute(['eventManager']), getEventManagerEvents);

router.route('/:id')
    .get(cacheMiddleware(30), getEvent)                           // Single event — 30s cache (tickets change)
    .put(protectRoute(['eventManager']), upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]), updateEvent)
    .delete(protectRoute(['eventManager']), deleteEvent);
    
router.get('/:id/eventAnalytics', protectRoute(['eventManager']), cacheMiddleware(30), getEventAnalytics);
router.put('/:id/cancel', protectRoute(['eventManager']), cancelEvent);

export default router;