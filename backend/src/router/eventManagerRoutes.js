import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import { 
    getEventManagers, geteventManager, putEventManager, 
    deleteEventManager, changeActiveStatus, getEventsAttendees,
    getEventAttendees, getEventManagerEvents, getEventManagerRevenue,
    getMyProfile, updateMyProfile, changePassword 
} from '../controller/eventManagerController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();
// Profile & Password
router.get('/profile/me', protectRoute(['eventManager']), getMyProfile);
router.put('/profile/me', protectRoute(['eventManager']), upload.single('profilePic'), updateMyProfile);
router.put('/change-password', protectRoute(['eventManager']), changePassword); 
// Event Stats & Data
router.get('/events/attendees', protectRoute(['eventManager', 'admin']), getEventsAttendees);
router.get('/events/attendees/:id', protectRoute(['eventManager', 'admin']), getEventAttendees);
router.get('/events/my-events', protectRoute(['eventManager']), getEventManagerEvents);
router.get('/revenue/my-revenue', protectRoute(['eventManager']), getEventManagerRevenue);
router.route('/changeStatus/:id').put(protectRoute(['admin']), changeActiveStatus);
router.route('/')
    .get(protectRoute(["admin"]), getEventManagers);
router.route('/:id')
    .get(protectRoute(['admin', 'eventManager']), geteventManager)
    .put(protectRoute(['admin', 'eventManager']), putEventManager)
    .delete(protectRoute(['admin']), deleteEventManager);
export default router;