import express from 'express';
import protectRoute from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

import {
  getEventManagers,
  geteventManager,
  putEventManager,
  deleteEventManager,
  changeActiveStatus,
  getEventsAttendees,
  getEventAttendees,
  getEventManagerEvents,
  getEventManagerRevenue,
  getMyProfile,
  updateMyProfile,
  changePassword,
  getManagerEventDetails
} from '../controller/eventManagerController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EventManager:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userName:
 *           type: string
 *         email:
 *           type: string
 *         profilePic:
 *           type: string
 *         companyName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         isActive:
 *           type: boolean
 *       example:
 *         _id: "6650ab234"
 *         userName: "John Manager"
 *         email: "manager@email.com"
 *         profilePic: "/uploads/profile.jpg"
 *         companyName: "Pet Events Ltd"
 *         phoneNumber: "9876543210"
 *         isActive: true
 */

/**
 * @swagger
 * tags:
 *   name: EventManagers
 *   description: Event manager management APIs
 */

/**
 * @swagger
 * /api/eventManagers/profile/me:
 *   get:
 *     summary: Get logged-in event manager profile
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager profile
 */
router.get('/profile/me', protectRoute(['eventManager']), getMyProfile);

/**
 * @swagger
 * /api/eventManagers/profile/me:
 *   put:
 *     summary: Update event manager profile
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               companyName:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put(
  '/profile/me',
  protectRoute(['eventManager']),
  upload.single('profilePic'),
  updateMyProfile
);

/**
 * @swagger
 * /api/eventManagers/change-password:
 *   put:
 *     summary: Change event manager password
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.put('/change-password', protectRoute(['eventManager']), changePassword);

/**
 * @swagger
 * /api/eventManagers/events/attendees:
 *   get:
 *     summary: Get attendees for all events
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendee list
 */
router.get(
  '/events/attendees',
  protectRoute(['eventManager', 'admin']),
  getEventsAttendees
);

/**
 * @swagger
 * /api/eventManagers/events/attendees/{id}:
 *   get:
 *     summary: Get attendees for a specific event
 *     tags: [EventManagers]
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
 *         description: Event attendees
 */
router.get(
  '/events/attendees/:id',
  protectRoute(['eventManager', 'admin']),
  getEventAttendees
);

/**
 * @swagger
 * /api/eventManagers/events/my-events:
 *   get:
 *     summary: Get events created by event manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of events
 */
router.get(
  '/events/my-events',
  protectRoute(['eventManager']),
  getEventManagerEvents
);

/**
 * @swagger
 * /api/eventManagers/revenue/my-revenue:
 *   get:
 *     summary: Get revenue for event manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue details
 */
router.get(
  '/revenue/my-revenue',
  protectRoute(['eventManager']),
  getEventManagerRevenue
);

/**
 * @swagger
 * /api/eventManagers/changeStatus/{id}:
 *   put:
 *     summary: Change event manager active status
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status updated
 */
router.route('/changeStatus/:id')
  .put(protectRoute(['admin']), changeActiveStatus);

/**
 * @swagger
 * /api/eventManagers:
 *   get:
 *     summary: Get all event managers (Admin)
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of event managers
 */
router.route('/')
  .get(protectRoute(["admin"]), getEventManagers);

/**
 * @swagger
 * /api/eventManagers/{id}:
 *   get:
 *     summary: Get event manager by ID
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager details
 *
 *   put:
 *     summary: Update event manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager updated
 *
 *   delete:
 *     summary: Delete event manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager deleted
 */
router.route('/:id')
  .get(protectRoute(['admin', 'eventManager']), geteventManager)
  .put(protectRoute(['admin', 'eventManager']), putEventManager)
  .delete(protectRoute(['admin']), deleteEventManager);

/**
 * @swagger
 * /api/eventManagers/events/{eventId}/details:
 *   get:
 *     summary: Get event details for manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 */
router.get(
  '/events/:eventId/details',
  protectRoute(['eventManager']),
  getManagerEventDetails
);

export default router;