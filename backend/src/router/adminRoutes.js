import express from "express";
import {
  logout,
  // admin-Customer.ejs, admin-Customer-details.ejs
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  adminGetUsers,
  getUsersWithRevenue,

  // admin-products.ejs, admin-product-details.ejs, admin-add-product.ejs
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
  getProductRatings,

  // admin-shop-manager.ejs, admin-sm-details.ejs
  getVendors,
  getVendorStats,
  adminGetVendors,
  getVendor,
  getVendorRevenueMetrics,
  getVendorOrdersByDateRange,
  getVendorProducts,
  getVendorTopCustomers,
  updateVendor,
  deleteVendor,
  getTopVendors,
  getVendorsWithRevenue,

  // admin-events.ejs, admin-em-details.ejs, admin-event-details.ejs
  getTopEvents,
  getTopEventManagers,
  getEventManagers,
  getEventManagerStats,
  getTotalEvents,
  getEventManager,
  getEventManagerMetrics,
  getUpcomingEvents,
  getPastEvents,
  getEventManagerEventsByDateRange,
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
  getEventReviews,

  // admin-orders.ejs, admin-order-details.ejs
  getOrders,
  getOrderDetails,
  getOrderStats,

  // admin-dashboard.ejs
  dashBoardStats,
  getRevenueChartData,
  getTopSpenders,
} from "../controller/adminController.js"; // Corrected import syntax for controller functions
import upload from "../middleware/uploadMiddleware.js";
import protectRoute from "../middleware/authMiddleware.js";
import cacheMiddleware, {
  invalidateCache,
} from "../middleware/cacheMiddleware.js";

const router = express.Router();

// ─────────────────────────────────────────────────────
// Cache Key Generators for Admin Routes
// ─────────────────────────────────────────────────────
const userListKeyGen = () => "admin:users:list";
const userStatsKeyGen = () => "admin:users:stats";
const usersWithRevenueKeyGen = () => "admin:users:with-revenue";
const topSpendersKeyGen = () => "admin:users:top-spenders";

// ─────────────────────────────────────────────────────
// Cache Invalidation Middleware for User Operations
// ─────────────────────────────────────────────────────
const invalidateUserCache = async (req, res, next) => {
  try {
    await invalidateCache("admin:users:", "admin:users:");
  } catch (err) {
    console.warn("⚠️ Failed to invalidate user cache:", err.message);
  }
  next();
};

// Same pattern for other entity types
const invalidateVendorCache = async (req, res, next) => {
  try {
    await invalidateCache("admin:vendors:");
  } catch (err) {
    console.warn("⚠️ Failed to invalidate vendor cache:", err.message);
  }
  next();
};

const invalidateProductCache = async (req, res, next) => {
  try {
    await invalidateCache("admin:products:");
  } catch (err) {
    console.warn("⚠️ Failed to invalidate product cache:", err.message);
  }
  next();
};
// =======================================================
router.get("/logout", protectRoute(["admin"]), logout);

// 2. DASHBOARD / STATS
// =======================================================
router.get("/stats", protectRoute(["admin"]), dashBoardStats);
router.get("/revenue-chart", protectRoute(["admin"]), getRevenueChartData);
// After the other customer routes
router.get(
  "/customers/top-spenders",
  protectRoute(["admin"]),
  cacheMiddleware(120, topSpendersKeyGen),
  getTopSpenders,
);
// Add this line near your other customer routes
router.get(
  "/customers/with-revenue",
  protectRoute(["admin"]),
  cacheMiddleware(120, usersWithRevenueKeyGen),
  getUsersWithRevenue,
);

// =======================================================
// 3. CUSTOMER (USER) MANAGEMENT
// =======================================================
router.get(
  "/customers",
  protectRoute(["admin"]),
  cacheMiddleware(60, userListKeyGen),
  getUsers,
);
router.get(
  "/customers/stats",
  protectRoute(["admin"]),
  cacheMiddleware(60, userStatsKeyGen),
  getUserStats,
);
router.get("/customers/latest", protectRoute(["admin"]), adminGetUsers);
router.get("/customers/:id", protectRoute(["admin"]), getUser);
router.put(
  "/customers/:id",
  protectRoute(["admin"]),
  invalidateUserCache,
  updateUser,
);
router.delete(
  "/customers/:id",
  protectRoute(["admin"]),
  invalidateUserCache,
  deleteUser,
);

// =======================================================
// 4. VENDOR (SHOP MANAGER) MANAGEMENT
// =======================================================
router.get("/vendors/top-vendors", protectRoute(["admin"]), getTopVendors);
router.get(
  "/vendors/with-revenue",
  protectRoute(["admin"]),
  getVendorsWithRevenue,
);
router.get("/vendors", protectRoute(["admin"]), getVendors);
router.get("/vendors/stats", protectRoute(["admin"]), getVendorStats);
router.get("/vendors/latest", protectRoute(["admin"]), adminGetVendors);
router.get("/vendors/:id", protectRoute(["admin"]), getVendor);
router.get(
  "/vendors/:id/revenue",
  protectRoute(["admin"]),
  getVendorRevenueMetrics,
);
router.get(
  "/vendors/:id/orders-by-date",
  protectRoute(["admin"]),
  getVendorOrdersByDateRange,
);
router.get("/vendors/:id/products", protectRoute(["admin"]), getVendorProducts);
router.get(
  "/vendors/:id/top-customers",
  protectRoute(["admin"]),
  getVendorTopCustomers,
);
router.put("/vendors/:id", protectRoute(["admin"]), updateVendor);
router.delete("/vendors/:id", protectRoute(["admin"]), deleteVendor);

// =======================================================
// 5. PRODUCT MANAGEMENT
// =======================================================
router.get(
  "/products/top-ordered",
  protectRoute(["admin"]),
  getTopOrderedProducts,
);
router.get("/products", protectRoute(["admin"]), getProducts);
router.get("/products/stats", protectRoute(["admin"]), getProductStats);
router.get(
  "/products/with-revenue",
  protectRoute(["admin"]),
  getProductsWithRevenue,
);
router.post(
  "/products/add",
  protectRoute(["admin"]),
  upload.array("images", 5),
  addProduct,
);
router.get("/products/:id", protectRoute(["admin"]), getProduct);
router.get("/products/:id/data", protectRoute(["admin"]), getProductData);
router.get(
  "/products/:id/customers",
  protectRoute(["admin"]),
  getProductCustomers,
);
router.get("/products/:id/ratings", protectRoute(["admin"]), getProductRatings);
router.put(
  "/products/:id",
  protectRoute(["admin"]),
  upload.array("images", 5),
  updateProduct,
);
router.delete("/products/:id", protectRoute(["admin"]), deleteProduct);

// =======================================================
// 6. EVENT MANAGER MANAGEMENT
// =======================================================
router.get(
  "/event-managers/top-managers",
  protectRoute(["admin"]),
  getTopEventManagers,
);
router.get("/event-managers", protectRoute(["admin"]), getEventManagers);
router.get(
  "/event-managers/stats",
  protectRoute(["admin"]),
  getEventManagerStats,
);
router.get(
  "/event-managers/with-revenue",
  protectRoute(["admin"]),
  getEventManagersWithRevenue,
);
router.get("/event-managers/:id", protectRoute(["admin"]), getEventManager);
router.get(
  "/event-managers/:id/metrics",
  protectRoute(["admin"]),
  getEventManagerMetrics,
);
router.get(
  "/event-managers/:id/upcoming-events",
  protectRoute(["admin"]),
  getUpcomingEvents,
);
router.get(
  "/event-managers/:id/past-events",
  protectRoute(["admin"]),
  getPastEvents,
);
router.get(
  "/event-managers/:id/events-by-date",
  protectRoute(["admin"]),
  getEventManagerEventsByDateRange,
);
router.put(
  "/event-managers/:id",
  protectRoute(["admin"]),
  upload.single("profilePicFile"),
  updateEventManager,
);
router.delete(
  "/event-managers/:id",
  protectRoute(["admin"]),
  deleteEventManager,
);

// =======================================================
// 7. EVENT MANAGEMENT
// =======================================================
router.get("/events/top-events", protectRoute(["admin"]), getTopEvents);
router.get("/events", protectRoute(["admin"]), getEventsData);
router.get("/events/total", protectRoute(["admin"]), getTotalEvents);
router.get("/events/revenue", protectRoute(["admin"]), getEventRevenue);
router.get(
  "/events/with-revenue",
  protectRoute(["admin"]),
  getEventsWithRevenue,
);
router.get("/events/:id", protectRoute(["admin"]), getEvent);
router.get("/events/:id/attendees", protectRoute(["admin"]), getEventAttendees);
router.get("/events/:id/reviews", protectRoute(["admin"]), getEventReviews);
router.put(
  "/events/:id",
  protectRoute(["admin"]),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateEvent,
);

router.delete("/events/:id", protectRoute(["admin"]), deleteEvent);

// =======================================================
// 8. ORDER MANAGEMENT
// =======================================================
router.get("/orders", protectRoute(["admin"]), getOrders);
router.get("/orders/stats", protectRoute(["admin"]), getOrderStats);
router.get("/orders/:id", protectRoute(["admin"]), getOrderDetails);

export default router;
