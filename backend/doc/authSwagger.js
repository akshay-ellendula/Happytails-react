
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

