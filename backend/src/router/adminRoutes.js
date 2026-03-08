import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import protectRoute from '../middleware/authMiddleware.js';

import {
  logout,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  adminGetUsers,
  getUsersWithRevenue,
  getTopOrderedProducts,
  getProducts,
  getProductStats,
  deleteProduct,
  addProduct,
  getProduct,
  updateProduct,
  getProductData,
  getProductCustomers,
  getProductsWithRevenue,
  getVendors,
  getVendorStats,
  adminGetVendors,
  getVendor,
  getVendorRevenueMetrics,
  getVendorProducts,
  getVendorTopCustomers,
  updateVendor,
  deleteVendor,
  getTopVendors,
  getVendorsWithRevenue,
  getTopEvents,
  getTopEventManagers,
  getEventManagers,
  getEventManagerStats,
  getTotalEvents,
  getEventManager,
  getEventManagerMetrics,
  getUpcomingEvents,
  getPastEvents,
  updateEventManager,
  deleteEventManager,
  getEventManagersWithRevenue,
  getEventsData,
  deleteEvent,
  getEvent,
  getEventAttendees,
  updateEvent,
  getEventRevenue,
  getEventsWithRevenue,
  getOrders,
  getOrderDetails,
  getOrderStats,
  dashBoardStats,
  getRevenueChartData,
  getTopSpenders
} from '../controller/adminController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management APIs
 */

/**
 * @swagger
 * /api/admin/logout:
 *   get:
 *     summary: Logout admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/logout', protectRoute(['admin']), logout);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', protectRoute(['admin']), dashBoardStats);

/**
 * @swagger
 * /api/admin/revenue-chart:
 *   get:
 *     summary: Get revenue chart data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/revenue-chart', protectRoute(['admin']), getRevenueChartData);

/**
 * @swagger
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/customers', protectRoute(['admin']), getUsers);

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   get:
 *     summary: Get customer details
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/customers/:id', protectRoute(['admin']), getUser);

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 */
router.put('/customers/:id', protectRoute(['admin']), updateUser);

/**
 * @swagger
 * /api/admin/customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags: [Admin Customers]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/customers/:id', protectRoute(['admin']), deleteUser);

/**
 * @swagger
 * /api/admin/vendors:
 *   get:
 *     summary: Get vendors
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.get('/vendors', protectRoute(['admin']), getVendors);

/**
 * @swagger
 * /api/admin/vendors/{id}:
 *   get:
 *     summary: Get vendor details
 *     tags: [Admin Vendors]
 *     security:
 *       - bearerAuth: []
 */
router.get('/vendors/:id', protectRoute(['admin']), getVendor);

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 */
router.get('/products', protectRoute(['admin']), getProducts);

/**
 * @swagger
 * /api/admin/products/add:
 *   post:
 *     summary: Add product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/products/add',
  protectRoute(['admin']),
  upload.array('images', 5),
  addProduct
);

/**
 * @swagger
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/products/:id', protectRoute(['admin']), deleteProduct);

/**
 * @swagger
 * /api/admin/event-managers:
 *   get:
 *     summary: Get event managers
 *     tags: [Admin EventManagers]
 *     security:
 *       - bearerAuth: []
 */
router.get('/event-managers', protectRoute(['admin']), getEventManagers);

/**
 * @swagger
 * /api/admin/events:
 *   get:
 *     summary: Get all events
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 */
router.get('/events', protectRoute(['admin']), getEventsData);

/**
 * @swagger
 * /api/admin/events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Admin Events]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/events/:id', protectRoute(['admin']), deleteEvent);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/orders', protectRoute(['admin']), getOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 */
router.get('/orders/:id', protectRoute(['admin']), getOrderDetails);

export default router;
