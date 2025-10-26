// src/router/vendorRoutes.js (ESM)
import express from "express";
import vendorController from "../controller/vendorController.js"; // note the .js extension
import protectRoute from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Authentication Routes ---
router.post("/login", vendorController.serviceProviderLogin);
router.post("/signup", vendorController.storeSignup);
router.post("/logout", vendorController.logout);

// --- Dashboard & Analytics ---
router.get(
  "/dashboard",
  protectRoute(["store-manager", "eventManager"]),
  vendorController.getVendorDashboard
);
router.get(
  "/profile",
  protectRoute(["store-manager", "eventManager"]),
  vendorController.getVendorProfile
);
router.put(
  "/profile",
  protectRoute(["store-manager", "eventManager"]),
  vendorController.updateVendorProfile
);
router.get(
  "/analytics",
  protectRoute(["store-manager", "eventManager"]),
  vendorController.getVendorAnalytics
);

// --- Product Management ---
router.get(
  "/products",
  protectRoute(["store-manager"]),
  vendorController.getVendorProducts
);
router.post(
  "/products",
  protectRoute(["store-manager"]),
  vendorController.submitProduct
);
router.get(
  "/products/:productId",
  protectRoute(["store-manager"]),
  vendorController.getProductForEdit
);
router.put(
  "/products/:productId",
  protectRoute(["store-manager"]),
  vendorController.updateProduct
);
router.delete(
  "/products/:productId",
  protectRoute(["store-manager"]),
  vendorController.deleteProduct
);

// --- Order Management ---
router.get(
  "/orders",
  protectRoute(["store-manager"]),
  vendorController.getVendorOrders
);
router.get(
  "/orders/:orderId",
  protectRoute(["store-manager"]),
  vendorController.getOrderDetails
);
router.put(
  "/orders/:orderId/status",
  protectRoute(["store-manager"]),
  vendorController.updateOrderStatus
);
router.delete(
  "/orders/:orderId",
  protectRoute(["store-manager"]),
  vendorController.deleteOrder
);
router.post(
  "/orders/delete-batch",
  protectRoute(["store-manager"]),
  vendorController.deleteSelectedOrders
);

// --- Customer Management ---
router.get(
  "/customers",
  protectRoute(["store-manager"]),
  vendorController.getVendorCustomers
);
router.get(
  "/customers/:customerId",
  protectRoute(["store-manager"]),
  vendorController.getVendorCustomerDetails
);

export default router;
