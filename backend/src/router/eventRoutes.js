import express from 'express';
import { postEvent, getEvents, getEvent, putEvent, deleteEvent } from '../controller/eventController.js';
import protectRoute from '../middleware/authMiddleware.js';
import upload from "../middleware/uploadMiddleware.js";
const router = express.Router();
router.route('/').get(protectRoute(['admin']), getEvents)
    .post(protectRoute(['eventManager']), upload.fields([
        { name: 'posterUrl_1', maxCount: 1 },
        { name: 'posterUrl_2', maxCount: 1 }
    ]), postEvent);
router.route('/:id').get(getEvent)
    .put(protectRoute(["eventManager"]), upload.fields([
        { name: 'posterUrl_1', maxCount: 1 },
        { name: 'posterUrl_2', maxCount: 1 }
    ]), putEvent)
    .delete(protectRoute(["admin", "eventManager"]), deleteEvent);
export default router;