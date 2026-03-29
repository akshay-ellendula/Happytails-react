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
 *     summary: Get the current event manager profile
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager profile returned successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "67f11c8ab8f4472fdd5ba201"
 *               userName: "Veda"
 *               email: "manager@gmail.com"
 *               profilePic: "https://avatar-api-theta.vercel.app/22.png"
 *               companyName: "HappyTails Events"
 *               phoneNumber: "9876543210"
 *               isActive: true
 *               createdAt: "2026-01-10T09:00:00.000Z"
 *               updatedAt: "2026-03-30T10:30:00.000Z"
 *       404:
 *         description: Event manager not found
 *   put:
 *     summary: Update the current event manager profile
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               companyName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               profilePic:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Profile updated successfully"
 *               eventManager:
 *                 userName: "Veda"
 *                 email: "manager@gmail.com"
 *                 profilePic: "https://avatar-api-theta.vercel.app/22.png"
 *                 companyName: "HappyTails Events"
 *                 phoneNumber: "9876543210"
 *       400:
 *         description: Invalid email or phone number format
 *       404:
 *         description: Event manager not found
 */

/**
 * @swagger
 * /api/eventManagers/change-password:
 *   put:
 *     summary: Change the event manager password
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Password updated successfully"
 *       400:
 *         description: Invalid password input or current password mismatch
 *       404:
 *         description: Event manager not found
 */

/**
 * @swagger
 * /api/eventManagers/events/attendees:
 *   get:
 *     summary: Get attendees across all events owned by the event manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendees returned successfully
 *         content:
 *           application/json:
 *             example:
 *               - _id: "67f11c8ab8f4472fdd5bf101"
 *                 ticketId: "TKT-12345"
 *                 numberOfTickets: 2
 *                 price: 500
 *                 purchaseDate: "2026-03-30T10:30:00.000Z"
 *                 eventId:
 *                   _id: "67f11c8ab8f4472fdd5bd101"
 *                   title: "Pet Adoption Camp"
 *                 customerId:
 *                   _id: "67f11c8ab8f4472fdd5bc001"
 *                   userName: "Jane Doe"
 *                   email: "jane.doe@gmail.com"
 */

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
 *         description: Event attendees returned successfully
 *         content:
 *           application/json:
 *             example:
 *               eventTitle: "Pet Adoption Camp"
 *               attendees:
 *                 - customerId: "67f11c8ab8f4472fdd5bc001"
 *                   customerName: "Jane Doe"
 *                   customerEmail: "jane.doe@gmail.com"
 *                   purchasedAt: "2026-03-30T10:30:00.000Z"
 *                   noOfTickets: 2
 *                   petName: "Bruno"
 *                   petBreed: "Beagle"
 *                   petAge: 18
 *       404:
 *         description: Event not found
 */

/**
 * @swagger
 * /api/eventManagers/events/my-events:
 *   get:
 *     summary: Get events owned by the current event manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager events returned successfully
 *         content:
 *           application/json:
 *             example:
 *               - _id: "67f11c8ab8f4472fdd5bd101"
 *                 title: "Pet Adoption Camp"
 *                 description: "Adopt lovely pets"
 *                 language: "English"
 *                 duration: "3h"
 *                 ageLimit: "All"
 *                 ticketPrice: 200
 *                 date_time: "2026-04-01T18:00:00.000Z"
 *                 category: "Pets"
 *                 venue: "City Hall"
 *                 location: "Chennai"
 *                 total_tickets: 100
 *                 tickets_sold: 20
 */

/**
 * @swagger
 * /api/eventManagers/revenue/my-revenue:
 *   get:
 *     summary: Get total revenue for the current event manager
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue returned successfully
 *         content:
 *           application/json:
 *             example: 8200
 */

/**
 * @swagger
 * /api/eventManagers/changeStatus/{id}:
 *   put:
 *     summary: Toggle the active status for an event manager
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
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "eventManager status updated successfully"
 *       404:
 *         description: Event manager not found
 */

/**
 * @swagger
 * /api/eventManagers:
 *   get:
 *     summary: Get all event managers
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event managers returned successfully
 *         content:
 *           application/json:
 *             example:
 *               - _id: "67f11c8ab8f4472fdd5ba201"
 *                 userName: "Veda"
 *                 email: "manager@gmail.com"
 *                 profilePic: "https://avatar-api-theta.vercel.app/22.png"
 *                 companyName: "HappyTails Events"
 *                 phoneNumber: "9876543210"
 *                 isActive: true
 */

/**
 * @swagger
 * /api/eventManagers/{id}:
 *   get:
 *     summary: Get an event manager by id
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
 *         description: Event manager returned successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "67f11c8ab8f4472fdd5ba201"
 *               userName: "Veda"
 *               email: "manager@gmail.com"
 *               profilePic: "https://avatar-api-theta.vercel.app/22.png"
 *               companyName: "HappyTails Events"
 *               phoneNumber: "9876543210"
 *               isActive: true
 *       404:
 *         description: Event manager not found
 *   put:
 *     summary: Update an event manager by id
 *     tags: [EventManagers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userName, email, profilePic, companyName, phoneNumber]
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               profilePic:
 *                 type: string
 *               companyName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event manager updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *       400:
 *         description: Invalid email or phone number format
 *       404:
 *         description: Event manager not found or required fields missing
 *   delete:
 *     summary: Delete an event manager
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
 *         description: Event manager deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "eventManager deleted successfully"
 *       404:
 *         description: Event manager not found
 */

/**
 * @swagger
 * /api/eventManagers/events/{eventId}/details:
 *   get:
 *     summary: Get event details for an event manager view
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
 *         description: Event details returned successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 event:
 *                   _id: "67f11c8ab8f4472fdd5bd101"
 *                   title: "Pet Adoption Camp"
 *                   venue: "City Hall"
 *                   date_time: "2026-04-01T18:00:00.000Z"
 *                 financials:
 *                   totalTicketsSold: 20
 *                   grossRevenue: 4000
 *                   totalTaxes: "720.00"
 *                   netRevenue: "3280.00"
 *                 attendees:
 *                   - _id: "67f11c8ab8f4472fdd5bf101"
 *                     orderId: "67f11c8ab8f4472fdd5bf101"
 *                     customerName: "Jane Doe"
 *                     email: "jane.doe@gmail.com"
 *                     quantity: 2
 *                     amountPaid: 500
 *       404:
 *         description: Event not found
 */
