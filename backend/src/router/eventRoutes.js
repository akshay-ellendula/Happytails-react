import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    createEvent,
    getEventManagerEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    getEventAnalytics,
    getAllEvents
} from '../controller/eventController.js';

const router = express.Router();

router.get('/public', getAllEvents);


router.route('/')
    .post(protectRoute(['eventManager']), upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]), createEvent)
    .get(protectRoute(['eventManager']), getEventManagerEvents);

router.route('/:id')
    .get( getEvent)
    .put(protectRoute(['eventManager']), upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]), updateEvent)
    .delete(protectRoute(['eventManager']), deleteEvent);
    
router.get('/:id/eventAnalytics', protectRoute(['eventManager']), getEventAnalytics);

export default router;