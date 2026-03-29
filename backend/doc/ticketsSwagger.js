/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket purchase and management APIs
 */

/**
 * @swagger
 * /api/tickets/admin/all:
 *   get:
 *     summary: Get all tickets for admin review
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets returned successfully
 *         content:
 *           application/json:
 *             example:
 *               - _id: "67f11c8ab8f4472fdd5bf101"
 *                 ticketId: "TKT-12345"
 *                 numberOfTickets: 2
 *                 price: 500
 *                 purchaseDate: "2026-03-30T11:30:00.000Z"
 *                 status: true
 *                 petName: "Bruno"
 *                 petBreed: "Beagle"
 *                 petAge: 18
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
 * /api/tickets/admin/{id}:
 *   get:
 *     summary: Get a single ticket by id as admin
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
 *         description: Ticket returned successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "67f11c8ab8f4472fdd5bf101"
 *               ticketId: "TKT-12345"
 *               numberOfTickets: 2
 *               price: 500
 *               purchaseDate: "2026-03-30T11:30:00.000Z"
 *               status: true
 *               eventId:
 *                 _id: "67f11c8ab8f4472fdd5bd101"
 *                 title: "Pet Adoption Camp"
 *               customerId:
 *                 _id: "67f11c8ab8f4472fdd5bc001"
 *                 userName: "Jane Doe"
 *                 email: "jane.doe@gmail.com"
 *       404:
 *         description: Ticket not found
 */

/**
 * @swagger
 * /api/tickets/my-tickets:
 *   get:
 *     summary: Get tickets for the current customer
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer tickets returned successfully
 *         content:
 *           application/json:
 *             example:
 *               - _id: "67f11c8ab8f4472fdd5bf101"
 *                 ticketId: "TKT-12345"
 *                 numberOfTickets: 2
 *                 price: 500
 *                 purchaseDate: "2026-03-30T11:30:00.000Z"
 *                 eventId:
 *                   _id: "67f11c8ab8f4472fdd5bd101"
 *                   title: "Pet Adoption Camp"
 *                 customerId:
 *                   _id: "67f11c8ab8f4472fdd5bc001"
 *                   userName: "Jane Doe"
 *       404:
 *         description: No tickets found for this user
 */

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get tickets for the current event manager
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event manager tickets returned successfully
 *         content:
 *           application/json:
 *             example:
 *               - id: "67f11c8ab8f4472fdd5bf101"
 *                 ticketId: "TKT-d5bf101"
 *                 eventName: "Pet Adoption Camp"
 *                 customerName: "Jane Doe"
 *                 customerEmail: "jane.doe@gmail.com"
 *                 purchaseDate: "2026-03-30T11:30:00.000Z"
 *                 price: 500
 *                 status: "active"
 *                 numberOfTickets: 2
 *                 petDetails: "Bruno (Beagle, 18 months)"
 */

/**
 * @swagger
 * /api/tickets/{id}:
 *   post:
 *     summary: Purchase tickets for an event
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Event id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [numberOfTickets, name, phone, email]
 *             properties:
 *               numberOfTickets:
 *                 type: number
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               petName:
 *                 type: string
 *               petBreed:
 *                 type: string
 *               petAge:
 *                 type: number
 *     responses:
 *       201:
 *         description: Ticket purchased successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Tickets booked successfully! Total: Rs500"
 *               ticket:
 *                 _id: "67f11c8ab8f4472fdd5bf101"
 *                 eventId: "67f11c8ab8f4472fdd5bd101"
 *                 customerId: "67f11c8ab8f4472fdd5bc001"
 *                 numberOfTickets: 2
 *                 price: 500
 *                 contactName: "Jane Doe"
 *                 contactPhone: "9876543210"
 *                 contactEmail: "jane.doe@gmail.com"
 *                 petName: "Bruno"
 *                 petBreed: "Beagle"
 *                 petAge: 18
 *       400:
 *         description: Not enough tickets available
 *       404:
 *         description: Event not found
 *   get:
 *     summary: Get a single ticket as the owning event manager
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
 *         description: Ticket returned successfully
 *         content:
 *           application/json:
 *             example:
 *               _id: "67f11c8ab8f4472fdd5bf101"
 *               ticketId: "TKT-12345"
 *               numberOfTickets: 2
 *               price: 500
 *               status: true
 *               petName: "Bruno"
 *               petBreed: "Beagle"
 *               petAge: 18
 *               eventId:
 *                 _id: "67f11c8ab8f4472fdd5bd101"
 *                 title: "Pet Adoption Camp"
 *                 venue: "City Hall"
 *               customerId:
 *                 _id: "67f11c8ab8f4472fdd5bc001"
 *                 userName: "Jane Doe"
 *                 email: "jane.doe@gmail.com"
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
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
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Ticket deleted successfully"
 *       404:
 *         description: Ticket not found
 */
