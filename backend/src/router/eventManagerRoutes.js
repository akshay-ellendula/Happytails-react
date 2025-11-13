import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import { 
    getEventManagers, geteventManager, putEventManager, 
    deleteEventManager, changeActiveStatus, getEventsAttendees,
    getEventAttendees, getEventManagerEvents, getEventManagerRevenue,
    getMyProfile, updateMyProfile, changePassword 
} from '../controller/eventManagerController.js';

const router = express.Router();

// Admin only routes
router.route('/')
    .get(protectRoute(["admin"]), getEventManagers);

router.route('/:id')
    .get(protectRoute(['admin', 'eventManager']), geteventManager)
    .put(protectRoute(['admin', 'eventManager']), putEventManager)
    .delete(protectRoute(['admin']), deleteEventManager);

router.route('/changeStatus/:id').put(protectRoute(['admin']), changeActiveStatus);

// Event Manager specific routes
router.get('/profile/me', protectRoute(['eventManager']), getMyProfile);
router.put('/profile/me', protectRoute(['eventManager']), updateMyProfile);
router.put('/change-password', protectRoute(['eventManager']), changePassword); 
router.get('/events/attendees', protectRoute(['eventManager', 'admin']), getEventsAttendees);
router.get('/events/attendees/:id', protectRoute(['eventManager', 'admin']), getEventAttendees);
router.get('/events/my-events', protectRoute(['eventManager']), getEventManagerEvents);
router.get('/revenue/my-revenue', protectRoute(['eventManager']), getEventManagerRevenue);
router.put('/change-password', protectRoute(['eventManager']), changePassword);

export default router;