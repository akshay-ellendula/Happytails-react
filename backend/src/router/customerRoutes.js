import express from 'express';
import { getCustomers, getCustomer, putCustomer, deleteCustomer, changeActiveStatus } from '../controller/customerControllers.js'
import protectRoute from '../middleware/authMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'
const router = express.Router();
router.route('/').get(protectRoute(["admin","customer"]),getCustomers);
router.route('/:id').get(protectRoute(["admin","customer"]),getCustomer).put(protectRoute(["admin","customer"]),upload.single("profilePicImage"),putCustomer).delete(protectRoute(["admin"]),deleteCustomer);
router.route("/changeStatus/:id").put(protectRoute(["admin"]),changeActiveStatus);

export default router;