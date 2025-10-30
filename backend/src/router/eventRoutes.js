import express from 'express';
import { 
    postEvent, 
    getEvents, 
    getEvent, 
    putEvent, 
    deleteEvent, 
    getPublicEvents,
    changeEventStatus
} from '../controller/eventController.js';
import protectRoute from '../middleware/authMiddleware.js';
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public route
router.get('/public/upcoming', getPublicEvents);

// Protected routes
router.route('/')
    .get(protectRoute(['admin']), getEvents)
    .post(protectRoute(['eventManager']), upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]), postEvent);

router.route('/:id')
    .get(getEvent)
    .put(protectRoute(["eventManager"]), upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'banner', maxCount: 1 }
    ]), putEvent)
    .delete(protectRoute(["admin", "eventManager"]), deleteEvent);

router.put('/:id/status', protectRoute(["admin", "eventManager"]), changeEventStatus);

export default router;