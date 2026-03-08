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
/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Admin:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userName:
 *           type: string
 *         email:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "6650ab123"
 *         userName: "Admin User"
 *         email: "admin@email.com"
 *
 *     StorePartner:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userName:
 *           type: string
 *         email:
 *           type: string
 *         contactnumber:
 *           type: string
 *         storename:
 *           type: string
 *         storelocation:
 *           type: string
 *         profilePic:
 *           type: string
 *         storeDescription:
 *           type: string
 *         isActive:
 *           type: boolean
 *       example:
 *         _id: "6650ab234"
 *         userName: "Store Owner"
 *         email: "store@email.com"
 *         contactnumber: "9876543210"
 *         storename: "Pet Store"
 *         storelocation: "Chennai"
 *         isActive: true
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         customer_id:
 *           type: string
 *         order_date:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *         subtotal:
 *           type: number
 *         total_amount:
 *           type: number
 *         delivery_date:
 *           type: string
 *           format: date-time
 *         shipped_at:
 *           type: string
 *           format: date-time
 *         delivered_at:
 *           type: string
 *           format: date-time
 *         cancelled_at:
 *           type: string
 *           format: date-time
 *         payment_last_four:
 *           type: string
 *         is_deleted:
 *           type: boolean
 *         shippingAddress:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             houseNumber:
 *               type: string
 *             streetNo:
 *               type: string
 *             city:
 *               type: string
 *             pincode:
 *               type: string
 *         timeline:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *       example:
 *         _id: "6650ab345"
 *         customer_id: "6650ab111"
 *         status: "Pending"
 *         subtotal: 500
 *         total_amount: 550
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         order_id:
 *           type: string
 *         product_id:
 *           type: string
 *         variant_id:
 *           type: string
 *         vendor_id:
 *           type: string
 *         product_name:
 *           type: string
 *         quantity:
 *           type: number
 *         price:
 *           type: number
 *         size:
 *           type: string
 *         color:
 *           type: string
 *       example:
 *         _id: "6650ab456"
 *         order_id: "6650ab345"
 *         product_name: "Dog Toy"
 *         quantity: 2
 *         price: 250
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         ticketId:
 *           type: string
 *         eventId:
 *           type: string
 *         customerId:
 *           type: string
 *         contactName:
 *           type: string
 *         contactPhone:
 *           type: string
 *         contactEmail:
 *           type: string
 *         numberOfTickets:
 *           type: number
 *         price:
 *           type: number
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: boolean
 *         petName:
 *           type: string
 *         petBreed:
 *           type: string
 *         petAge:
 *           type: number
 *       example:
 *         _id: "6654bcf001"
 *         ticketId: "TKT-12345"
 *         eventId: "6654bcf002"
 *         customerId: "6654bcf003"
 *         contactName: "John Doe"
 *         contactPhone: "9876543210"
 *         contactEmail: "john@email.com"
 *         numberOfTickets: 2
 *         price: 500
 *         status: true
 */

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management API
 */

/**
 * @swagger
 * /api/tickets/admin/all:
 *   get:
 *     summary: Get all tickets (Admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 */
router.get('/admin/all', protectRoute(['admin']), getTickets);

/**
 * @swagger
 * /api/tickets/admin/{id}:
 *   get:
 *     summary: Get ticket by ID (Admin)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket details
 */
router.get('/admin/:id', protectRoute(['admin']), getTicket);

/**
 * @swagger
 * /api/tickets/my-tickets:
 *   get:
 *     summary: Get logged-in customer tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User tickets list
 */
router.get('/my-tickets', protectRoute(['customer']), getUserTicket);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get tickets for event manager
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager tickets
 */
router.get('/', protectRoute(['eventManager']), getEventManagerTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   post:
 *     summary: Purchase a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Event ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactName:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               numberOfTickets:
 *                 type: number
 *               price:
 *                 type: number
 *               petName:
 *                 type: string
 *               petBreed:
 *                 type: string
 *               petAge:
 *                 type: number
 *     responses:
 *       201:
 *         description: Ticket purchased successfully
 */
router.post('/:id', protectRoute(['customer']), postTicket);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket details (Event Manager)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket details
 */
router.get('/:id', protectRoute(['eventManager']), getTicketDetails);

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 */
router.delete('/:id', protectRoute(['admin', 'eventManager']), deleteTicket);

export default router;

