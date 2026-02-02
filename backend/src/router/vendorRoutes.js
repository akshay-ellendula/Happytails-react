import express from "express";
import vendorController from "../controller/vendorController.js"; 
import protectRoute from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"; //

const router = express.Router();
router.post("/logout", vendorController.logout);// --- Dashboard & Analytics ---
router.get(
  "/dashboard",
  protectRoute(["vendor", "eventManager"]), // Updated role
  vendorController.getVendorDashboard
);
router.get(
  "/profile",
  protectRoute(["vendor", "eventManager"]),
  vendorController.getVendorProfile
);
router.put(
  "/profile",
  protectRoute(["vendor", "eventManager"]),
  vendorController.updateVendorProfile
);
router.put(
  "/change-password",
  protectRoute(["vendor", "eventManager"]),
  vendorController.changePassword
);
router.get(
  "/analytics",
  protectRoute(["vendor", "eventManager"]),
  vendorController.getVendorAnalytics
);

// --- Product Management ---
router.get(
  "/products",
  protectRoute(["vendor"]),
  vendorController.getVendorProducts
);

// Added upload.array for images
router.post(
  "/products",
  protectRoute(["vendor"]),
  upload.array("product_images", 5), 
  vendorController.submitProduct
);

router.get(
  "/products/:productId",
  protectRoute(["vendor"]),
  vendorController.getProductForEdit
);

// Added upload.array for images
router.put(
  "/products/:productId",
  protectRoute(["vendor"]),
  upload.array("product_images", 5),
  vendorController.updateProduct
);

router.delete(
  "/products/:productId",
  protectRoute(["vendor"]),
  vendorController.deleteProduct
);

// --- Order Management ---
router.get(
  "/orders",
  protectRoute(["vendor"]),
  vendorController.getVendorOrders
);
router.get(
  "/orders/:orderId",
  protectRoute(["vendor"]),
  vendorController.getOrderDetails
);
router.put(
  "/orders/:orderId/status",
  protectRoute(["vendor"]),
  vendorController.updateOrderStatus
);
router.delete(
  "/orders/:orderId",
  protectRoute(["vendor"]),
  vendorController.deleteOrder
);
router.post(
  "/orders/delete-batch",
  protectRoute(["vendor"]),
  vendorController.deleteSelectedOrders
);

// --- Customer Management ---
router.get(
  "/customers",
  protectRoute(["vendor"]),
  vendorController.getVendorCustomers
);
router.get(
  "/customers/:customerId",
  protectRoute(["vendor"]),
  vendorController.getVendorCustomerDetails
);

export default router;