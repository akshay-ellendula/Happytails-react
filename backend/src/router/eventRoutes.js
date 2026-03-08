import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  createEvent,
  getEventManagerEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getEventAnalytics,
  getAllEvents
} from '../controller/eventController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         eventManagerId:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         language:
 *           type: string
 *         duration:
 *           type: string
 *         ageLimit:
 *           type: string
 *         ticketPrice:
 *           type: number
 *         date_time:
 *           type: string
 *           format: date-time
 *         category:
 *           type: string
 *         venue:
 *           type: string
 *         location:
 *           type: string
 *         total_tickets:
 *           type: number
 *         tickets_sold:
 *           type: number
 *         images:
 *           type: object
 *           properties:
 *             thumbnail:
 *               type: string
 *             banner:
 *               type: string
 *       example:
 *         _id: "66545abc001"
 *         eventManagerId: "66545abc002"
 *         title: "Pet Adoption Camp"
 *         description: "Adopt lovely pets"
 *         language: "English"
 *         duration: "3 Hours"
 *         ageLimit: "All"
 *         ticketPrice: 200
 *         date_time: "2026-04-01T18:00:00Z"
 *         category: "Pets"
 *         venue: "City Hall"
 *         location: "Chennai"
 *         total_tickets: 100
 *         tickets_sold: 20
 */

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Event management APIs
 */

/**
 * @swagger
 * /api/events/public:
 *   get:
 *     summary: Get all public events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of all events
 */
router.get('/public', getAllEvents);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get events created by event manager
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager events
 *
 *   post:
 *     summary: Create new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               language:
 *                 type: string
 *               duration:
 *                 type: string
 *               ageLimit:
 *                 type: string
 *               ticketPrice:
 *                 type: number
 *               date_time:
 *                 type: string
 *                 format: date-time
 *               category:
 *                 type: string
 *               venue:
 *                 type: string
 *               location:
 *                 type: string
 *               total_tickets:
 *                 type: number
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.route('/')
  .post(
    protectRoute(['eventManager']),
    upload.fields([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'banner', maxCount: 1 }
    ]),
    createEvent
  )
  .get(protectRoute(['eventManager']), getEventManagerEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event details
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event updated
 *
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.route('/:id')
  .get(getEvent)
  .put(
    protectRoute(['eventManager']),
    upload.fields([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'banner', maxCount: 1 }
    ]),
    updateEvent
  )
  .delete(protectRoute(['eventManager']), deleteEvent);

/**
 * @swagger
 * /api/events/{id}/eventAnalytics:
 *   get:
 *     summary: Get analytics for an event
 *     tags: [Events]
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
 *         description: Event analytics data
 */
router.get('/:id/eventAnalytics', protectRoute(['eventManager']), getEventAnalytics);

export default router;

