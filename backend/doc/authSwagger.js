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
 *     summary: Register a customer account
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userName, email, password]
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               user:
 *                 customerId: "67f11c8ab8f4472fdd5bc001"
 *                 email: "jane.doe@gmail.com"
 *                 userName: "Jane Doe"
 *                 profilePic: "https://avatar-api-theta.vercel.app/17.png"
 *                 role: "customer"
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already registered
 */

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Sign in a customer
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               user:
 *                 customerId: "67f11c8ab8f4472fdd5bc001"
 *                 email: "jane.doe@gmail.com"
 *                 userName: "Jane Doe"
 *                 profilePic: "https://avatar-api-theta.vercel.app/17.png"
 *                 role: "customer"
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Clear the active auth cookie
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /api/auth/eventManagerSignup:
 *   post:
 *     summary: Register an event manager account
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userName, email, password, contactnumber, companyname, location]
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               contactnumber:
 *                 type: string
 *               companyname:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event manager registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already registered
 */

/**
 * @swagger
 * /api/auth/eventManagerSignin:
 *   post:
 *     summary: Sign in an event manager
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/adminSignup:
 *   post:
 *     summary: Register an admin account
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userName, email, password]
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already registered
 */

/**
 * @swagger
 * /api/auth/adminSignin:
 *   post:
 *     summary: Sign in as admin
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Admin login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/storeSignup:
 *   post:
 *     summary: Register a vendor account
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userName, email, password, contactnumber, storename, storelocation]
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               contactnumber:
 *                 type: string
 *               storename:
 *                 type: string
 *               storelocation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email or store name already registered
 */

/**
 * @swagger
 * /api/auth/storeSignin:
 *   post:
 *     summary: Sign in as vendor
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Vendor login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Check current authentication state
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Authentication state resolved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   additionalProperties: true
 *             examples:
 *               authenticated:
 *                 summary: Authenticated session
 *                 value:
 *                   authenticated: true
 *                   user:
 *                     customerId: "67f11c8ab8f4472fdd5bc001"
 *                     email: "jane.doe@gmail.com"
 *                     userName: "Jane Doe"
 *                     profilePic: "https://avatar-api-theta.vercel.app/17.png"
 *                     role: "customer"
 *               anonymous:
 *                 summary: No active session
 *                 value:
 *                   authenticated: false
 */

/**
 * @swagger
 * /api/auth/forgotpassword:
 *   post:
 *     summary: Send a password reset link
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [customer, eventManager, vendor]
 *                 default: customer
 *     responses:
 *       200:
 *         description: Reset link sent
 *       404:
 *         description: Email not found
 */

/**
 * @swagger
 * /api/auth/resetpassword/{resetToken}:
 *   put:
 *     summary: Reset a password with a reset token
 *     tags: [Authentication]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: resetToken
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *           enum: [customer, eventManager, vendor]
 *           default: customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Start Google OAuth login
 *     tags: [Authentication]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *           enum: [customer, eventManager, vendor]
 *           default: customer
 *     responses:
 *       302:
 *         description: Redirects to Google's OAuth consent screen
 */

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Handle the Google OAuth callback
 *     tags: [Authentication]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: code
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: false
 *         schema:
 *           type: string
 *           description: Role forwarded through the OAuth flow
 *     responses:
 *       302:
 *         description: Redirects to the frontend after login
 */

/**
 * @swagger
 * /api/auth/google/url:
 *   get:
 *     summary: Get the Google OAuth URL for frontend redirects
 *     tags: [Authentication]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *           enum: [customer, eventManager, vendor]
 *           default: customer
 *     responses:
 *       200:
 *         description: Google OAuth URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *             example:
 *               url: "http://localhost:5001/api/auth/google?role=customer"
 */
