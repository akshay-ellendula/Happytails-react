import express from 'express';
import {
    // admin-login.ejs
    adminLogin,
    logout,

    // admin-Customer.ejs, admin-Customer-details.ejs
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getUserStats,
    adminGetUsers,

    // admin-products.ejs, admin-product-details.ejs, admin-add-product.ejs
    getProducts,
    getProductStats,
    deleteProduct,
    addProduct,
    getProduct,
    updateProduct,
    getProductData,
    getProductCustomers,

    // admin-shop-manager.ejs, admin-sm-details.ejs
    getVendors,
    getVendorStats,
    adminGetVendors,
    getVendor,
    getVendorRevenueMetrics,
    getVendorProducts,
    getVendorTopCustomers,
    updateVendor,
    deleteVendor,

    // admin-events.ejs, admin-em-details.ejs, admin-event-details.ejs
    getEventManagers,
    getEventManagerStats,
    getTotalEvents,
    getEventManager,
    getEventManagerMetrics,
    getUpcomingEvents,
    getPastEvents,
    updateEventManager,
    deleteEventManager,
    getEventsData,
    deleteEvent,
    getEvent,
    getEventAttendees,
    updateEvent,
    getEventRevenue,

    // admin-orders.ejs, admin-order-details.ejs
    getOrders,
    getOrderDetails,
    getOrderStats,

    // admin-dashboard.ejs
    dashBoardStats,
    getRevenueChartData,
} from '../controller/adminController.js'; // Corrected import syntax for controller functions
import upload from '../middleware/uploadMiddleware.js'; 
import protectRoute from '../middleware/authMiddleware.js'; 

const router = express.Router();

// =======================================================
// 1. ADMIN AUTHENTICATION
// =======================================================
router.post('/login', adminLogin);
router.get('/logout', protectRoute(['admin']), logout);


// =======================================================
// 2. DASHBOARD / STATS
// =======================================================
router.get('/stats', protectRoute(['admin']), dashBoardStats);
router.get('/revenue-chart', protectRoute(['admin']), getRevenueChartData);


// =======================================================
// 3. CUSTOMER (USER) MANAGEMENT
// =======================================================
router.get('/customers', protectRoute(['admin']), getUsers);
router.get('/customers/stats', protectRoute(['admin']), getUserStats);
router.get('/customers/latest', protectRoute(['admin']), adminGetUsers); 
router.get('/customers/:id', protectRoute(['admin']), getUser);
router.put('/customers/:id', protectRoute(['admin']), updateUser);
router.delete('/customers/:id', protectRoute(['admin']), deleteUser);


// =======================================================
// 4. VENDOR (SHOP MANAGER) MANAGEMENT
// =======================================================
router.get('/vendors', protectRoute(['admin']), getVendors);
router.get('/vendors/stats', protectRoute(['admin']), getVendorStats);
router.get('/vendors/latest', protectRoute(['admin']), adminGetVendors);
router.get('/vendors/:id', protectRoute(['admin']), getVendor);
router.get('/vendors/:id/revenue', protectRoute(['admin']), getVendorRevenueMetrics);
router.get('/vendors/:id/products', protectRoute(['admin']), getVendorProducts);
router.get('/vendors/:id/top-customers', protectRoute(['admin']), getVendorTopCustomers);
router.put('/vendors/:id', protectRoute(['admin']), updateVendor);
router.delete('/vendors/:id', protectRoute(['admin']), deleteVendor);


// =======================================================
// 5. PRODUCT MANAGEMENT
// =======================================================
router.get('/products', protectRoute(['admin']), getProducts);
router.get('/products/stats', protectRoute(['admin']), getProductStats);
router.post(
    '/products/add', 
    protectRoute(['admin']),
    upload.array('images', 5), 
    addProduct
);
router.get('/products/:id', protectRoute(['admin']), getProduct);
router.get('/products/:id/data', protectRoute(['admin']), getProductData); 
router.get('/products/:id/customers', protectRoute(['admin']), getProductCustomers);
router.put(
    '/products/:id', 
    protectRoute(['admin']),
    upload.array('images', 5), 
    updateProduct
);
router.delete('/products/:id', protectRoute(['admin']), deleteProduct);


// =======================================================
// 6. EVENT MANAGER MANAGEMENT
// =======================================================
router.get('/event-managers', protectRoute(['admin']), getEventManagers);
router.get('/event-managers/stats', protectRoute(['admin']), getEventManagerStats);
router.get('/event-managers/:id', protectRoute(['admin']), getEventManager);
router.get('/event-managers/:id/metrics', protectRoute(['admin']), getEventManagerMetrics);
router.get('/event-managers/:id/upcoming-events', protectRoute(['admin']), getUpcomingEvents);
router.get('/event-managers/:id/past-events', protectRoute(['admin']), getPastEvents);
router.put(
    '/event-managers/:id', 
    protectRoute(['admin']),
    upload.single('profilePicFile'), 
    updateEventManager
);
router.delete('/event-managers/:id', protectRoute(['admin']), deleteEventManager);


// =======================================================
// 7. EVENT MANAGEMENT
// =======================================================
router.get('/events', protectRoute(['admin']), getEventsData);
router.get('/events/total', protectRoute(['admin']), getTotalEvents);
router.get('/events/revenue', protectRoute(['admin']), getEventRevenue);
router.get('/events/:id', protectRoute(['admin']), getEvent);
router.get('/events/:id/attendees', protectRoute(['admin']), getEventAttendees);
router.put(
    '/events/:id', 
    protectRoute(['admin']),
    upload.fields([
        { name: 'thumbnail', maxCount: 1 }, 
        { name: 'banner', maxCount: 1 }
    ]),
    updateEvent
);

router.delete('/events/:id', protectRoute(['admin']), deleteEvent);


// =======================================================
// 8. ORDER MANAGEMENT
// =======================================================
router.get('/orders', protectRoute(['admin']), getOrders);
router.get('/orders/stats', protectRoute(['admin']), getOrderStats);
router.get('/orders/:id', protectRoute(['admin']), getOrderDetails);


export default router;