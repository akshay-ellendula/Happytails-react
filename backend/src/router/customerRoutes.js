
import express from 'express';
import { getCustomers, getCustomer, putCustomer, deleteCustomer, changeActiveStatus } from '../controller/customerControllers.js';
import protectRoute from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the customer
 *         userName:
 *           type: string
 *           description: The customer's username
 *         email:
 *           type: string
 *           description: The customer's email address
 *         profilePic:
 *           type: string
 *           description: URL or base64 string of the profile picture
 *         phoneNumber:
 *           type: string
 *           description: Contact number
 *         isActive:
 *           type: boolean
 *           description: Account status
 *         addresses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               houseNumber:
 *                 type: string
 *               streetNo:
 *                 type: string
 *               city:
 *                 type: string
 *               pincode:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *       example:
 *         _id: "65a12345bcdef67890"
 *         userName: "John Doe"
 *         email: "johndoe@gmail.com"
 *         phoneNumber: "1234567890"
 *         isActive: true
 */

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
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Unauthorized
 */
router.route('/')
  .get(protectRoute(["admin","customer"]), getCustomers);

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
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *
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
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
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
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Customer not found
 *
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
 *       404:
 *         description: Customer not found
 */
router.route('/:id')
  .get(protectRoute(["admin","customer"]), getCustomer)
  .put(protectRoute(["admin","customer"]), upload.single("profilePic"), putCustomer)
  .delete(protectRoute(["admin"]), deleteCustomer);

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
 *       404:
 *         description: Customer not found
 */
router.route("/changeStatus/:id")
  .put(protectRoute(["admin"]), changeActiveStatus);

export default router;
