import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import { 
    getTickets, 
    getTicket, 
    deleteTicket, 
    postTicket, 
    getUserTicket 
} from '../controller/ticketControllers.js';

const router = express.Router();

// Admin routes
router.route('/')
    .get(protectRoute(['admin']), getTickets);

// Customer ticket purchase
router.route('/:id')
    .post(protectRoute(['customer']), postTicket);

// Get specific ticket
router.route('/:id')
    .get(protectRoute(['admin', 'eventManager']), getTicket)
    .delete(protectRoute(['admin', 'eventManager']), deleteTicket);

// User's tickets
router.get('/user/tickets', protectRoute(['customer']), getUserTicket);

export default router;