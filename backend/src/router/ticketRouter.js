// backend/src/router/ticketRouter.js

import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import {
    getEventManagerTickets,
    getTicketDetails,
    getTickets,
    getTicket,
    deleteTicket,
    postTicket,
    getUserTicket
} from '../controller/ticketControllers.js';

const router = express.Router();

router.get('/admin/all', protectRoute(['admin']), getTickets);
router.get('/admin/:id', protectRoute(['admin']), getTicket);
router.get('/my-tickets', protectRoute(['customer']), getUserTicket);
router.get('/', protectRoute(['eventManager']), getEventManagerTickets);
router.post('/:id', protectRoute(['customer']), postTicket);
router.get('/:id', protectRoute(['eventManager']), getTicketDetails);
router.delete('/:id', protectRoute(['admin', 'eventManager']), deleteTicket);

export default router;