import express from 'express';
import adminController from '../controller/adminController.js';
import upload from './uploadMiddleware.js'; 
import protectRoute from './authMiddleware.js'; 

const router = express.Router();

router.post('/login', adminController.adminLogin);
router.get('/logout', protectRoute(['admin']), adminController.logout);

router.get('/stats', protectRoute(['admin']), adminController.dashBoardStats);
router.get('/revenue-chart', protectRoute(['admin']), adminController.getRevenueChartData);

router.get('/customers', protectRoute(['admin']), adminController.getUsers);
router.get('/customers/stats', protectRoute(['admin']), adminController.getUserStats);
router.get('/customers/latest', protectRoute(['admin']), adminController.adminGetUsers); 
router.get('/customers/:id', protectRoute(['admin']), adminController.getUser);
router.put('/customers/:id', protectRoute(['admin']), adminController.updateUser);
router.delete('/customers/:id', protectRoute(['admin']), adminController.deleteUser);

router.get('/vendors', protectRoute(['admin']), adminController.getVendors);
router.get('/vendors/stats', protectRoute(['admin']), adminController.getVendorStats);
router.get('/vendors/latest', protectRoute(['admin']), adminController.adminGetVendors);
router.get('/vendors/:id', protectRoute(['admin']), adminController.getVendor);
router.get('/vendors/:id/revenue', protectRoute(['admin']), adminController.getVendorRevenueMetrics);
router.get('/vendors/:id/products', protectRoute(['admin']), adminController.getVendorProducts);
router.get('/vendors/:id/top-customers', protectRoute(['admin']), adminController.getVendorTopCustomers);
router.put('/vendors/:id', protectRoute(['admin']), adminController.updateVendor);
router.delete('/vendors/:id', protectRoute(['admin']), adminController.deleteVendor);

router.get('/products', protectRoute(['admin']), adminController.getProducts);
router.get('/products/stats', protectRoute(['admin']), adminController.getProductStats);
router.post(
    '/products/add', 
    protectRoute(['admin']),
    upload.array('images', 5), 
    adminController.addProduct
);
router.get('/products/:id', protectRoute(['admin']), adminController.getProduct);
router.get('/products/:id/data', protectRoute(['admin']), adminController.getProductData); 
router.get('/products/:id/customers', protectRoute(['admin']), adminController.getProductCustomers);
router.put(
    '/products/:id', 
    protectRoute(['admin']),
    upload.array('images', 5), 
    adminController.updateProduct
);
router.delete('/products/:id', protectRoute(['admin']), adminController.deleteProduct);

router.get('/event-managers', protectRoute(['admin']), adminController.getEventManagers);
router.get('/event-managers/stats', protectRoute(['admin']), adminController.getEventManagerStats);
router.get('/event-managers/:id', protectRoute(['admin']), adminController.getEventManager);
router.get('/event-managers/:id/metrics', protectRoute(['admin']), adminController.getEventManagerMetrics);
router.get('/event-managers/:id/upcoming-events', protectRoute(['admin']), adminController.getUpcomingEvents);
router.get('/event-managers/:id/past-events', protectRoute(['admin']), adminController.getPastEvents);
router.put(
    '/event-managers/:id', 
    protectRoute(['admin']),
    upload.single('profilePicFile'), 
    adminController.updateEventManager
);
router.delete('/event-managers/:id', protectRoute(['admin']), adminController.deleteEventManager);

router.get('/events', protectRoute(['admin']), adminController.getEventsData);
router.get('/events/total', protectRoute(['admin']), adminController.getTotalEvents);
router.get('/events/revenue', protectRoute(['admin']), adminController.getEventRevenue);
router.get('/events/:id', protectRoute(['admin']), adminController.getEvent);
router.get('/events/:id/attendees', protectRoute(['admin']), adminController.getEventAttendees);
router.put(
    '/events/:id', 
    protectRoute(['admin']),
    upload.fields([
        { name: 'thumbnail', maxCount: 1 }, 
        { name: 'banner', maxCount: 1 }
    ]),
    adminController.updateEvent
);

router.delete('/events/:id', protectRoute(['admin']), adminController.deleteEvent);
router.get('/orders', protectRoute(['admin']), adminController.getOrders);
router.get('/orders/stats', protectRoute(['admin']), adminController.getOrderStats);
router.get('/orders/:id', protectRoute(['admin']), adminController.getOrderDetails);


export default router;