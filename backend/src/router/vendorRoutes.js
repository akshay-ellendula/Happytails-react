import express from "express";
import vendorController from "../controller/vendorController.js";
import protectRoute from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; //

const router = express.Router();
router.post("/logout", vendorController.logout); // --- Dashboard & Analytics ---
router.get(
  "/dashboard",
  protectRoute(["vendor", "eventManager"]), // Updated role
  vendorController.getVendorDashboard,
);
router.get(
  "/profile",
  protectRoute(["vendor", "eventManager"]),
  vendorController.getVendorProfile,
);
router.put(
  "/profile",
  protectRoute(["vendor", "eventManager"]),
  vendorController.updateVendorProfile,
);
router.get(
  "/settings",
  protectRoute(["vendor"]),
  vendorController.getVendorSettings,
);
router.put(
  "/settings",
  protectRoute(["vendor"]),
  vendorController.updateVendorSettings,
);
router.put(
  "/change-password",
  protectRoute(["vendor", "eventManager"]),
  vendorController.changePassword,
);
router.get(
  "/analytics",
  protectRoute(["vendor", "eventManager"]),
  vendorController.getVendorAnalytics,
);

// ─── Top Selling Products ────────────────────────────────────────
router.get(
  "/products/top3",
  protectRoute(["vendor"]),
  vendorController.getVendorTop3Products,
);
router.get(
  "/products/all-sorted",
  protectRoute(["vendor"]),
  vendorController.getVendorProductsSorted,
);

// ─── Product Ratings ─────────────────────────────────────────────
router.get(
  "/products/ratings",
  protectRoute(["vendor"]),
  vendorController.getVendorProductRatings,
);

// --- Product Management ---
router.get(
  "/products",
  protectRoute(["vendor"]),
  vendorController.getVendorProducts,
);

// Added upload.array for images
router.post(
  "/products",
  protectRoute(["vendor"]),
  upload.array("product_images", 5),
  vendorController.submitProduct,
);

router.get(
  "/products/:productId",
  protectRoute(["vendor"]),
  vendorController.getProductForEdit,
);

// Added upload.array for images
router.put(
  "/products/:productId",
  protectRoute(["vendor"]),
  upload.array("product_images", 5),
  vendorController.updateProduct,
);

router.delete(
  "/products/:productId",
  protectRoute(["vendor"]),
  vendorController.deleteProduct,
);

// --- Order Management ---
router.get(
  "/orders",
  protectRoute(["vendor"]),
  vendorController.getVendorOrders,
);
router.get(
  "/orders/:orderId",
  protectRoute(["vendor"]),
  vendorController.getOrderDetails,
);
router.put(
  "/orders/:orderId/status",
  protectRoute(["vendor"]),
  vendorController.updateOrderStatus,
);
router.delete(
  "/orders/:orderId",
  protectRoute(["vendor"]),
  vendorController.deleteOrder,
);
router.post(
  "/orders/delete-batch",
  protectRoute(["vendor"]),
  vendorController.deleteSelectedOrders,
);

// --- Customer Management ---
router.get(
  "/customers",
  protectRoute(["vendor"]),
  vendorController.getVendorCustomers,
);
router.get(
  "/customers/all-sorted",
  protectRoute(["vendor"]),
  vendorController.getVendorCustomersSorted,
);
router.get(
  "/customers/:customerId",
  protectRoute(["vendor"]),
  vendorController.getVendorCustomerDetails,
);

// --- Order Notes ---
router.post(
  "/orders/:orderId/notes",
  protectRoute(["vendor"]),
  vendorController.addOrderNote,
);

// --- Batch Status Update ---
router.post(
  "/orders/batch-status",
  protectRoute(["vendor"]),
  vendorController.batchUpdateOrderStatus,
);

// --- Quick Stock Update ---
router.put(
  "/products/:productId/stock",
  protectRoute(["vendor"]),
  vendorController.updateProductStock,
);

// --- CSV Bulk Upload ---
router.post(
  "/products/bulk-upload",
  protectRoute(["vendor"]),
  vendorController.bulkUploadProducts,
);

export default router;
