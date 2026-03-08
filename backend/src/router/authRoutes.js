import express from 'express';
import {
  logout,
  signin,
  signup,
  eventManagersignin,
  eventManagersignup,
  adminSignin,
  adminSignup,
  verifyAuth,
  storePartnerSignup,
  storePartnerSignin,
  forgotPassword,
  resetPassword
} from '../controller/authControllers.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication and authorization APIs
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Customer signup
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.route('/signup').post(signup);

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Customer login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.route('/signin').post(signin);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.route('/logout').post(logout);

/**
 * @swagger
 * /api/auth/eventManagerSignup:
 *   post:
 *     summary: Event manager signup
 *     tags: [Authentication]
 *     responses:
 *       201:
 *         description: Event manager registered
 */
router.route('/eventManagerSignup').post(eventManagersignup);

/**
 * @swagger
 * /api/auth/eventManagerSignin:
 *   post:
 *     summary: Event manager login
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Login successful
 */
router.route('/eventManagerSignin').post(eventManagersignin);

/**
 * @swagger
 * /api/auth/adminSignup:
 *   post:
 *     summary: Admin signup
 *     tags: [Authentication]
 *     responses:
 *       201:
 *         description: Admin registered
 */
router.route('/adminSignup').post(adminSignup);

/**
 * @swagger
 * /api/auth/adminSignin:
 *   post:
 *     summary: Admin login
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Admin login successful
 */
router.route('/adminSignin').post(adminSignin);

/**
 * @swagger
 * /api/auth/storeSignup:
 *   post:
 *     summary: Store partner signup
 *     tags: [Authentication]
 *     responses:
 *       201:
 *         description: Store partner registered
 */
router.route('/storeSignup').post(storePartnerSignup);

/**
 * @swagger
 * /api/auth/storeSignin:
 *   post:
 *     summary: Store partner login
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Store partner login successful
 */
router.route('/storeSignin').post(storePartnerSignin);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify authentication token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token verified
 */
router.get('/verify', verifyAuth);

/**
 * @swagger
 * /api/auth/forgotpassword:
 *   post:
 *     summary: Send password reset email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent
 */
router.route('/forgotpassword').post(forgotPassword);

/**
 * @swagger
 * /api/auth/resetpassword/{resetToken}:
 *   put:
 *     summary: Reset password using token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: resetToken
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.route('/resetpassword/:resetToken').put(resetPassword);

export default router;
