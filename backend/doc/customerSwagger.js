/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management API
 */

/**
 * @swagger
 * /api/public:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of customers
 *         content:
 *           application/json:
 *             example:
 *               - _id: "67f11c8ab8f4472fdd5bc001"
 *                 userName: "Jane Doe"
 *                 email: "jane.doe@gmail.com"
 *                 profilePic: "https://avatar-api-theta.vercel.app/17.png"
 *                 phoneNumber: "9876543210"
 *                 addresses:
 *                   - name: "Home"
 *                     houseNumber: "22"
 *                     streetNo: "Lake View Road"
 *                     city: "Chennai"
 *                     pincode: "600001"
 *                     isDefault: true
 *                 isActive: true
 *                 createdAt: "2026-03-15T09:00:00.000Z"
 *                 updatedAt: "2026-03-30T10:30:00.000Z"
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/public/{id}:
 *   get:
 *     summary: Get a customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             example:
 *               _id: "67f11c8ab8f4472fdd5bc001"
 *               userName: "Jane Doe"
 *               email: "jane.doe@gmail.com"
 *               profilePic: "https://avatar-api-theta.vercel.app/17.png"
 *               phoneNumber: "9876543210"
 *               addresses:
 *                 - name: "Home"
 *                   houseNumber: "22"
 *                   streetNo: "Lake View Road"
 *                   city: "Chennai"
 *                   pincode: "600001"
 *                   isDefault: true
 *               isActive: true
 *               createdAt: "2026-03-15T09:00:00.000Z"
 *               updatedAt: "2026-03-30T10:30:00.000Z"
 *       404:
 *         description: Customer not found
 *   put:
 *     summary: Update a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [userName, email]
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               addresses:
 *                 type: string
 *                 description: JSON stringified array of addresses
 *               profilePic:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture file
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Customer updated successfully"
 *               user:
 *                 customerId: "67f11c8ab8f4472fdd5bc001"
 *                 userName: "Jane Doe"
 *                 email: "jane.doe@gmail.com"
 *                 profilePic: "https://avatar-api-theta.vercel.app/17.png"
 *                 phoneNumber: "9876543210"
 *                 addresses:
 *                   - name: "Home"
 *                     houseNumber: "22"
 *                     streetNo: "Lake View Road"
 *                     city: "Chennai"
 *                     pincode: "600001"
 *                     isDefault: true
 *                 role: "customer"
 *       400:
 *         description: Invalid request body, email, or address format
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Customer not found
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Customer deleted successfully"
 *       404:
 *         description: Customer not found
 */

/**
 * @swagger
 * /api/public/changeStatus/{id}:
 *   put:
 *     summary: Toggle customer active status
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer status updated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Customer status updated"
 *       404:
 *         description: Customer not found
 */
