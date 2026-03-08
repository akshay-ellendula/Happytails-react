import express from "express";
import vendorController from "../controller/vendorController.js";
import protectRoute from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Vendor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         contact_number:
 *           type: string
 *         email:
 *           type: string
 *         store_name:
 *           type: string
 *         store_location:
 *           type: string
 *         description:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "65abc12345"
 *         name: "Vendor Name"
 *         contact_number: "9876543210"
 *         email: "vendor@email.com"
 *         store_name: "Fresh Store"
 *         store_location: "Chennai"
 *         description: "Organic food vendor"
 */

/**
 * @swagger
 * tags:
 *   name: Vendor
 *   description: Vendor management APIs
 */

/**
 * @swagger
 * /api/vendor/logout:
 *   post:
 *     summary: Logout vendor
 *     tags: [Vendor]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", vendorController.logout);

/**
 * @swagger
 * /api/vendor/dashboard:
 *   get:
 *     summary: Get vendor dashboard data
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data returned
 */
router.get(
  "/dashboard",
  protectRoute(["vendor", "eventManager"]),
  vendorController.getVendorDashboard
);

/**
 * @swagger
 * /api/vendor/profile:
 *   get:
 *     summary: Get vendor profile
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendor profile data
 */
router.get(
  "/profile",
  protectRoute(["vendor", "eventManager"]),
  vendorController.getVendorProfile
);

/**
 * @swagger
 * /api/vendor/profile:
 *   put:
 *     summary: Update vendor profile
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put(
  "/profile",
  protectRoute(["vendor", "eventManager"]),
  vendorController.updateVendorProfile
);

/**
 * @swagger
 * /api/vendor/change-password:
 *   put:
 *     summary: Change vendor password
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password updated
 */
router.put(
  "/change-password",
  protectRoute(["vendor", "eventManager"]),
  vendorController.changePassword
);

/**
 * @swagger
 * /api/vendor/analytics:
 *   get:
 *     summary: Get vendor analytics
 *     tags: [Vendor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get(
  "/analytics",
  protectRoute(["vendor", "eventManager"]),
  vendorController.getVendorAnalytics
);

/**
 * @swagger
 * /api/vendor/products:
 *   get:
 *     summary: Get vendor products
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product list
 */
router.get(
  "/products",
  protectRoute(["vendor"]),
  vendorController.getVendorProducts
);

/**
 * @swagger
 * /api/vendor/products:
 *   post:
 *     summary: Add new product
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               product_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created
 */
router.post(
  "/products",
  protectRoute(["vendor"]),
  upload.array("product_images", 5),
  vendorController.submitProduct
);

/**
 * @swagger
 * /api/vendor/products/{productId}:
 *   get:
 *     summary: Get product details
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product data
 */
router.get(
  "/products/:productId",
  protectRoute(["vendor"]),
  vendorController.getProductForEdit
);

/**
 * @swagger
 * /api/vendor/products/{productId}:
 *   put:
 *     summary: Update product
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated
 */
router.put(
  "/products/:productId",
  protectRoute(["vendor"]),
  upload.array("product_images", 5),
  vendorController.updateProduct
);

/**
 * @swagger
 * /api/vendor/products/{productId}:
 *   delete:
 *     summary: Delete product
 *     tags: [Vendor Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product deleted
 */
router.delete(
  "/products/:productId",
  protectRoute(["vendor"]),
  vendorController.deleteProduct
);

/**
 * @swagger
 * /api/vendor/orders:
 *   get:
 *     summary: Get vendor orders
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders list
 */
router.get(
  "/orders",
  protectRoute(["vendor"]),
  vendorController.getVendorOrders
);

/**
 * @swagger
 * /api/vendor/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Vendor Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put(
  "/orders/:orderId/status",
  protectRoute(["vendor"]),
  vendorController.updateOrderStatus
);

/**
 * @swagger
 * /api/vendor/customers:
 *   get:
 *     summary: Get vendor customers
 *     tags: [Vendor Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer list
 */
router.get(
  "/customers",
  protectRoute(["vendor"]),
  vendorController.getVendorCustomers
);

export default router;