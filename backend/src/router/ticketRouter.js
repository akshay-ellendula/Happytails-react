import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import { getTickets } from '../controller/ticketControllers.js';
const router = express.Router();
router.route('/').get(protectRoute(['Admin']), getTickets);
router.route('/:id')
export default router;