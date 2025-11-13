import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import {
    getEventManagerTickets,
    getTicketDetails
} from '../controller/ticketControllers.js';

const router = express.Router();

router.get('/', protectRoute(['eventManager']), getEventManagerTickets);
router.get('/:id', protectRoute(['eventManager']), getTicketDetails);

export default router;