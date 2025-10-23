import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import { getEventManagers, geteventManager, putEventManager, deleteEventManager, changeActiveStatus } from '../controller/eventManagerController.js'
const router = express.Router();
router.route('/').get(protectRoute(["admin"]), getEventManagers);
router.route('/:id').get(protectRoute(['admin', 'eventManager']), geteventManager)
                    .put(protectRoute(['admin', 'eventManager']), putEventManager)
                    .delete(protectRoute(['admin']), deleteEventManager);
router.route('/changeStatus/:id').put(protectRoute(['admin']), changeActiveStatus)
export default router;