import mongoose from 'mongoose';
import Customer from '../models/customerModel.js';
import Vendor from '../models/vendorModel.js';
import { Product, ProductVariant, ProductImage } from '../models/productsModel.js';
import { Order, OrderItem } from '../models/orderModel.js';
import Event from '../models/eventModel.js';
import EventManager from '../models/eventManagerModel.js';
import Ticket from '../models/ticketModel.js';
import jwt from 'jsonwebtoken';
// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
};

// Verify JWT token
const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
};

const adminLogin = (req, res) => {
    const { admin_email, admin_password } = req.body;
    const admin = { email: "admin@gmail.com", password: "admin123#" };

    if (admin_email === admin.email && admin_password === admin.password) {
        const token = generateToken({
            email: admin_email,
            role: 'admin',
            id: 'admin'
        });

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "none",
            secure: true,

            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ success: true, token });
    } else {
        res.json({ success: false, error: "Invalid email or password" });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await Customer.find()
            .select('_id userName email createdAt')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            users: users.map(user => ({
                id: user._id,
                name: user.userName,
                email: user.email,
                joined_date: user.createdAt
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Customer.findById(userId)
            .select('_id userName email phoneNumber address profilePic createdAt');

        if (!user) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const formattedAddress = user.address ?
            `${user.address.houseNumber || ''}, ${user.address.streetNo || ''}, ${user.address.city || ''} - ${user.address.pincode || ''}`.trim().replace(/,\s*,\s*/g, ', ').replace(/^,\s*|,\s*$/g, '')
            : null;

        // Fetch purchase history (orders and items)
        const orders = await Order.find({ customer_id: userId });
        const orderIds = orders.map(o => o._id);
        const orderItems = await OrderItem.find({ order_id: { $in: orderIds } });
        const purchaseHistory = orderItems.map(item => {
            const order = orders.find(o => o._id.equals(item.order_id));
            return {
                productId: item.product_id ? item.product_id.toString() : 'Unknown',
                productName: item.product_name,
                purchaseDate: order ? order.order_date.toLocaleDateString() : 'Unknown',
                price: item.price ? `$${item.price.toFixed(2)}` : 'N/A'
            };
        });

        // Fetch event history using Ticket model
        const tickets = await Ticket.find({ customerId: userId });
        const eventHistory = await Promise.all(tickets.map(async (tkt) => {
            const ev = await Event.findById(tkt.eventId);
            if (!ev) return null;
            const now = new Date();
            const status = ev.date_time < now ? 'Attended' : 'Registered';
            return {
                eventId: ev._id.toString(),
                eventName: ev.title, // Use 'title'
                date: ev.date_time.toLocaleDateString(),
                location: ev.venue, // Use 'venue'
                status
            };
        }));
        const filteredEventHistory = eventHistory.filter(e => e !== null);

        res.json({
            success: true,
            Customer: {
                id: user._id.toString(),
                name: user.userName,
                email: user.email,
                phone: user.phoneNumber || null,
                address: formattedAddress,
                joined_date: user.createdAt.toLocaleDateString(),
                profile_pic: user.profilePic || null
            },
            purchaseHistory,
            eventHistory: filteredEventHistory
        });

    } catch (err) {
        console.error("Error in getUser:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { userName, phoneNumber, houseNumber, streetNo, city, pincode } = req.body;

        const user_address = houseNumber || streetNo || city || pincode ? { houseNumber, streetNo, city, pincode } : undefined;
        const addressFieldsProvided = houseNumber || streetNo || city || pincode;

        if (!userName) return res.status(400).json({ success: false, message: 'Name is required' });
        if (userName.length < 2) return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
        if (phoneNumber && !/^\+91[6-9][0-9]{9}$/.test(phoneNumber) && !/^[0-9]{10}$/.test(phoneNumber)) return res.status(400).json({ success: false, message: 'Phone must be a valid 10-digit number or Indian number starting with +91' });
        if (addressFieldsProvided && (!houseNumber || !city || !pincode)) {
            return res.status(400).json({ success: false, message: 'If updating address, House Number, City, and Pincode are required' });
        }

        const user = await Customer.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });

        const updateData = { userName };
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber || null;
        if (user_address !== undefined) updateData.address = user_address;

        await Customer.updateOne(
            { _id: userId },
            updateData
        );
        res.json({ success: true, message: 'Customer updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update Customer' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await Customer.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });

        await Customer.deleteOne({ _id: userId });
        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete Customer' });
    }
};

const getProductData = async (productId) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return null;
    }

    try {
        const product = await Product.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(productId) } },
            {
                $lookup: {
                    from: 'vendors',
                    localField: 'vendor_id',
                    foreignField: '_id',
                    as: 'vendor'
                }
            },
            { $unwind: '$vendor' },
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            { $unwind: '$variants' },
            {
                $lookup: {
                    from: 'productimages',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'images'
                }
            },
            {
                $project: {
                    _id: 0,
                    id: '$_id',
                    product_name: 1,
                    product_category: 1,
                    product_type: 1,
                    product_description: 1,
                    stock_status: 1,
                    created_at: 1,
                    sku: '$variants.sku',
                    regular_price: '$variants.regular_price',
                    sale_price: '$variants.sale_price',
                    stock_quantity: '$variants.stock_quantity',
                    vendor: {
                        store_name: '$vendor.store_name',
                        email: '$vendor.email'
                    },
                    image: {
                        $ifNull: [
                            { $arrayElemAt: [{ $filter: { input: '$images', as: 'img', cond: { $eq: ['$$img.is_primary', true] } } }, 0] },
                            { $arrayElemAt: ['$images', 0] }
                        ]
                    }
                }
            },
            {
                $project: {
                    id: 1,
                    product_name: 1,
                    product_category: 1,
                    product_type: 1,
                    product_description: 1,
                    stock_status: 1,
                    created_at: 1,
                    sku: 1,
                    regular_price: 1,
                    sale_price: 1,
                    stock_quantity: 1,
                    vendor: 1,
                    image: { $ifNull: ['$image.image_data', null] }
                }
            }
        ]);
        return product.length > 0 ? product[0] : null;
    } catch (err) {
        console.error('Error in getProductData:', err);
        throw err;
    }
};

const getProductCustomers = async (productId) => {
    try {
        const customers = await OrderItem.aggregate([
            { $match: { product_id: new mongoose.Types.ObjectId(productId) } },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'order.customer_id',
                    foreignField: '_id',
                    as: 'Customer'
                }
            },
            { $unwind: '$Customer' },
            {
                $project: {
                    _id: 0,
                    userName: '$Customer.userName',
                    email: '$Customer.email',
                    order_date: '$order.order_date',
                    quantity: '$quantity'
                }
            },
            { $sort: { order_date: -1 } }
        ]);

        return customers;
    } catch (err) {
        console.error('Error in getProductCustomers:', err);
        throw err;
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $lookup: {
                    from: 'vendors',
                    localField: 'vendor_id',
                    foreignField: '_id',
                    as: 'vendor'
                }
            },
            { $unwind: '$vendor' },
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            { $unwind: '$variants' },
            {
                $group: {
                    _id: '$_id',
                    id: { $first: '$_id' },
                    product_name: { $first: '$product_name' },
                    product_category: { $first: '$product_category' },
                    regular_price: { $first: '$variants.regular_price' },
                    stock_quantity: { $first: '$variants.stock_quantity' },
                    created_at: { $first: '$created_at' },
                    vendor: { $first: '$vendor.store_name' }
                }
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    product_name: 1,
                    category: '$product_category',
                    price: '$regular_price',
                    stock: '$stock_quantity',
                    added_date: '$created_at',
                    vendor: 1
                }
            },
            { $sort: { added_date: -1 } }
        ]);
        res.json({ success: true, products });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getUserStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const total = await Customer.countDocuments();
        const monthly = await Customer.countDocuments({ createdAt: { $gte: monthAgo } });
        const weekly = await Customer.countDocuments({ createdAt: { $gte: weekAgo } });
        const daily = await Customer.countDocuments({ createdAt: { $gte: today } });

        res.json({
            success: true,
            stats: { total, monthly, weekly, daily }
        });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

const getProductStats = async (req, res) => {
    try {
        const today = new Date();
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        const total = await Product.countDocuments();
        const totalLastMonth = await Product.countDocuments({ created_at: { $lt: monthAgo } });

        const inStockResult = await Product.aggregate([
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            { $match: { 'variants.stock_quantity': { $gt: 0 } } },
            { $group: { _id: null, count: { $addToSet: '$_id' } } },
            { $project: { inStock: { $size: '$count' } } }
        ]);
        const inStock = inStockResult.length > 0 ? inStockResult[0].inStock : 0;

        const inStockLastMonthResult = await Product.aggregate([
            { $match: { created_at: { $lt: monthAgo } } },
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            { $match: { 'variants.stock_quantity': { $gt: 0 } } },
            { $group: { _id: null, count: { $addToSet: '$_id' } } },
            { $project: { inStockLastMonth: { $size: '$count' } } }
        ]);
        const inStockLastMonth = inStockLastMonthResult.length > 0 ? inStockLastMonthResult[0].inStockLastMonth : 0;

        const lowStockResult = await Product.aggregate([
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            { $unwind: '$variants' },
            {
                $group: {
                    _id: '$_id',
                    totalStock: { $sum: '$variants.stock_quantity' }
                }
            },
            { $match: { totalStock: { $gte: 1, $lte: 5 } } },
            { $count: 'lowStock' }
        ]);
        const lowStock = lowStockResult.length > 0 ? lowStockResult[0].lowStock : 0;

        const lowStockLastWeekResult = await Product.aggregate([
            { $match: { created_at: { $lt: weekAgo } } },
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            { $unwind: '$variants' },
            {
                $group: {
                    _id: '$_id',
                    totalStock: { $sum: '$variants.stock_quantity' }
                }
            },
            { $match: { totalStock: { $gte: 1, $lte: 5 } } },
            { $count: 'lowStockLastWeek' }
        ]);
        const lowStockLastWeek = lowStockLastWeekResult.length > 0 ? lowStockLastWeekResult[0].lowStockLastWeek : 0;

        const outOfStockResult = await Product.aggregate([
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            { $unwind: '$variants' },
            {
                $group: {
                    _id: '$_id',
                    totalStock: { $sum: '$variants.stock_quantity' }
                }
            },
            { $match: { totalStock: 0 } },
            { $count: 'outOfStock' }
        ]);
        const outOfStock = outOfStockResult.length > 0 ? outOfStockResult[0].outOfStock : 0;

        const outOfStockYesterdayResult = await Product.aggregate([
            { $match: { created_at: { $lt: yesterday } } },
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            { $unwind: '$variants' },
            {
                $group: {
                    _id: '$_id',
                    totalStock: { $sum: '$variants.stock_quantity' }
                }
            },
            { $match: { totalStock: 0 } },
            { $count: 'outOfStockYesterday' }
        ]);
        const outOfStockYesterday = outOfStockYesterdayResult.length > 0 ? outOfStockYesterdayResult[0].outOfStockYesterday : 0;

        res.json({
            success: true,
            stats: {
                total,
                totalLastMonth,
                inStock,
                inStockLastMonth,
                lowStock,
                lowStockLastWeek,
                outOfStock,
                outOfStockYesterday
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const dashBoardStats = async (req, res) => {
    try {
        const now = new Date();
        now.setUTCHours(0, 0, 0, 0);
        const today = new Date(now);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalUsers = await Customer.countDocuments();
        const totalVendors = await Vendor.countDocuments();
        const totalEventManagers = await EventManager.countDocuments();
        const totalEvents = await Event.countDocuments();

        const totalRevenueOrders = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$subtotal' } } }
        ]);
        const totalRevenueOrdersValue = totalRevenueOrders.length > 0 ? totalRevenueOrders[0].total : 0;

        // Use Ticket model for event revenue
        const totalRevenueEvents = await Ticket.aggregate([
            { $lookup: { from: 'events', localField: 'eventId', foreignField: '_id', as: 'event' } },
            { $unwind: '$event' },
            // Group by OrderId/TicketId and sum the price field directly from the Ticket model
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        const totalRevenueEventsValue = totalRevenueEvents.length > 0 ? totalRevenueEvents[0].total : 0;

        const totalRevenue = (totalRevenueOrdersValue + totalRevenueEventsValue) * 0.1;

        // Monthly Revenue Events
        const monthlyRevenueEvents = await Ticket.aggregate([
            { $match: { purchaseDate: { $gte: monthAgo } } },
            { $lookup: { from: 'events', localField: 'eventId', foreignField: '_id', as: 'event' } },
            { $unwind: '$event' },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        const monthlyRevenueEventsValue = monthlyRevenueEvents.length > 0 ? monthlyRevenueEvents[0].total : 0;

        const monthlyRevenueOrders = await Order.aggregate([
            { $match: { order_date: { $gte: monthAgo } } },
            { $group: { _id: null, total: { $sum: '$subtotal' } } }
        ]);
        const monthlyRevenueOrdersValue = monthlyRevenueOrders.length > 0 ? monthlyRevenueOrders[0].total : 0;

        const monthlyRevenue = (monthlyRevenueOrdersValue + monthlyRevenueEventsValue) * 0.1;

        // Weekly Revenue Events
        const weeklyRevenueEvents = await Ticket.aggregate([
            { $match: { purchaseDate: { $gte: weekAgo } } },
            { $lookup: { from: 'events', localField: 'eventId', foreignField: '_id', as: 'event' } },
            { $unwind: '$event' },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        const weeklyRevenueEventsValue = weeklyRevenueEvents.length > 0 ? weeklyRevenueEvents[0].total : 0;

        const weeklyRevenueOrders = await Order.aggregate([
            { $match: { order_date: { $gte: weekAgo } } },
            { $group: { _id: null, total: { $sum: '$subtotal' } } }
        ]);
        const weeklyRevenueOrdersValue = weeklyRevenueOrders.length > 0 ? weeklyRevenueOrders[0].total : 0;

        const weeklyRevenue = (weeklyRevenueOrdersValue + weeklyRevenueEventsValue) * 0.1;

        // Daily Revenue Events
        const dailyRevenueEvents = await Ticket.aggregate([
            { $match: { purchaseDate: { $gte: today } } },
            { $lookup: { from: 'events', localField: 'eventId', foreignField: '_id', as: 'event' } },
            { $unwind: '$event' },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        const dailyRevenueEventsValue = dailyRevenueEvents.length > 0 ? dailyRevenueEvents[0].total : 0;

        const dailyRevenueOrders = await Order.aggregate([
            { $match: { order_date: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$subtotal' } } }
        ]);
        const dailyRevenueOrdersValue = dailyRevenueOrders.length > 0 ? dailyRevenueOrders[0].total : 0;

        const dailyRevenue = (dailyRevenueOrdersValue + dailyRevenueEventsValue) * 0.1;

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalVendors,
                totalEventManagers,
                totalEvents,
                totalRevenue,
                monthlyRevenue,
                weeklyRevenue,
                dailyRevenue
            }
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getRevenueChartData = async (req, res) => {
    try {
        const now = new Date();
        now.setUTCHours(0, 0, 0, 0);
        const months = [];
        const orderRevenueData = [];
        const eventRevenueData = [];

        // Generate last 12 months
        for (let i = 11; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthStart.setUTCHours(0, 0, 0, 0);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            monthEnd.setUTCHours(23, 59, 59, 999);
            months.push(monthStart.toLocaleString('default', { month: 'short' }));

            // Order Revenue (using subtotal)
            const orderRevenue = await Order.aggregate([
                { $match: { order_date: { $gte: monthStart, $lte: monthEnd } } },
                { $group: { _id: null, total: { $sum: '$subtotal' } } }
            ]);
            const orderRevenueValue = orderRevenue.length > 0 ? orderRevenue[0].total : 0;

            // Event Revenue using Ticket model (purchaseDate)
            const eventRevenue = await Ticket.aggregate([
                { $match: { purchaseDate: { $gte: monthStart, $lte: monthEnd } } },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ]);
            const eventRevenueValue = eventRevenue.length > 0 ? eventRevenue[0].total : 0;

            orderRevenueData.push(orderRevenueValue * 0.1); // 10% tax
            eventRevenueData.push(eventRevenueValue * 0.1); // 10% tax
        }

        res.json({
            success: true,
            chartData: {
                labels: months,
                orderRevenue: orderRevenueData,
                eventRevenue: eventRevenueData
            }
        });
    } catch (err) {
        console.error('Error fetching revenue chart data:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const adminGetUsers = async (req, res) => {
    try {
        const users = await Customer.find()
            .select('_id userName email createdAt')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json({
            success: true,
            users: users.map(user => ({
                id: user._id,
                name: user.userName,
                email: user.email,
                joined_date: user.createdAt
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find()
            .select('_id name email store_name store_location created_at')
            .sort({ created_at: -1 });
        res.json({
            success: true,
            vendors: vendors.map(vendor => ({
                id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                store_name: vendor.store_name,
                store_location: vendor.store_location,
                joined_date: vendor.created_at
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getVendorStats = async (req, res) => {
    try {
        const now = new Date();
        now.setUTCHours(0, 0, 0, 0);
        const today = new Date(now);
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Total shop managers
        const total = await Vendor.countDocuments();

        const totalRevenueAgg = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            { $group: { _id: '$product.vendor_id', totalSubtotal: { $sum: '$order.subtotal' } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalSubtotal' } } }
        ]);
        const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].totalRevenue * 0.1 : 0;

        const totalOrdersAgg = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            { $group: { _id: '$order._id', orderCount: { $first: 1 } } },
            { $group: { _id: null, totalOrders: { $sum: '$orderCount' } } }
        ]);
        const totalOrders = totalOrdersAgg.length > 0 ? totalOrdersAgg[0].totalOrders : 0;

        const todaysOrdersAgg = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            { $match: { 'order.order_date': { $gte: today } } },
            { $group: { _id: '$order._id', orderCount: { $first: 1 } } },
            { $group: { _id: null, todaysOrders: { $sum: '$orderCount' } } }
        ]);
        const todaysOrders = todaysOrdersAgg.length > 0 ? todaysOrdersAgg[0].todaysOrders : 0;

        const yesterdayOrdersAgg = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            { $match: { 'order.order_date': { $gte: yesterday, $lt: today } } },
            { $group: { _id: '$order._id', orderCount: { $first: 1 } } },
            { $group: { _id: null, yesterdayOrders: { $sum: '$orderCount' } } }
        ]);
        const yesterdayOrders = yesterdayOrdersAgg.length > 0 ? yesterdayOrdersAgg[0].yesterdayOrders : 0;
        const todaysOrdersChange = yesterdayOrders > 0 ? ((todaysOrders - yesterdayOrders) / yesterdayOrders) * 100 : (todaysOrders > 0 ? 100 : 0);

        const lastMonthAgg = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            { $match: { 'order.order_date': { $gte: monthAgo, $lt: today } } },
            {
                $group: {
                    _id: '$order._id',
                    lastMonthCount: { $first: 1 },
                    lastMonthSubtotal: { $first: '$order.subtotal' }
                }
            },
            { $group: { _id: null, lastMonthOrders: { $sum: '$lastMonthCount' }, lastMonthRevenue: { $sum: '$lastMonthSubtotal' } } }
        ]);
        const lastMonthOrders = lastMonthAgg.length > 0 ? lastMonthAgg[0].lastMonthOrders : 0;
        const lastMonthRevenue = lastMonthAgg.length > 0 ? lastMonthAgg[0].lastMonthRevenue * 0.1 : 0;

        const thisMonthAgg = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            { $match: { 'order.order_date': { $gte: monthAgo } } },
            {
                $group: {
                    _id: '$order._id',
                    thisMonthCount: { $first: 1 },
                    thisMonthSubtotal: { $first: '$order.subtotal' }
                }
            },
            { $group: { _id: null, thisMonthOrders: { $sum: '$thisMonthCount' }, thisMonthRevenue: { $sum: '$thisMonthSubtotal' } } }
        ]);
        const thisMonthOrders = thisMonthAgg.length > 0 ? thisMonthAgg[0].thisMonthOrders : 0;
        const thisMonthRevenue = thisMonthAgg.length > 0 ? thisMonthAgg[0].thisMonthRevenue * 0.1 : 0;

        const totalGrowthPercent = lastMonthOrders > 0 ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 : (thisMonthOrders > 0 ? 100 : 0);
        const revenueGrowthPercent = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : (thisMonthRevenue > 0 ? 100 : 0);
        const ordersGrowthPercent = lastMonthOrders > 0 ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 : (thisMonthOrders > 0 ? 100 : 0);

        res.json({
            success: true,
            stats: {
                total,
                totalRevenue,
                totalOrders,
                todaysOrders,
                totalGrowthPercent,
                revenueGrowthPercent,
                ordersGrowthPercent,
                todaysOrdersChange
            }
        });
    } catch (err) {
        console.error('Error fetching vendor stats:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const adminGetVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find()
            .select('_id name email created_at')
            .sort({ created_at: -1 })
            .limit(5);
        res.json({
            success: true,
            vendors: vendors.map(vendor => ({
                id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                joined_date: vendor.created_at
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getVendorRevenueMetrics = async (req, res) => {
    try {
        const vendorId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(400).json({ success: false, message: 'Invalid vendor ID' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const quarterStart = new Date(today.getFullYear(), today.getMonth() - 2, 1);

        // Aggregate revenue metrics (92% of subtotal)
        const revenueMetrics = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            { $match: { 'product.vendor_id': new mongoose.Types.ObjectId(vendorId) } },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            {
                $group: {
                    _id: null,
                    today_revenue: {
                        $sum: {
                            $cond: [
                                { $gte: ['$order.order_date', today] },
                                { $multiply: ['$order.subtotal', 0.92] },
                                0
                            ]
                        }
                    },
                    weekly_revenue: {
                        $sum: {
                            $cond: [
                                { $gte: ['$order.order_date', weekStart] },
                                { $multiply: ['$order.subtotal', 0.92] },
                                0
                            ]
                        }
                    },
                    monthly_revenue: {
                        $sum: {
                            $cond: [
                                { $gte: ['$order.order_date', monthStart] },
                                { $multiply: ['$order.subtotal', 0.92] },
                                0
                            ]
                        }
                    },
                    quarterly_revenue: {
                        $sum: {
                            $cond: [
                                { $gte: ['$order.order.order_date', quarterStart] },
                                { $multiply: ['$order.subtotal', 0.92] },
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Monthly breakdown for the last 12 months
        const monthlyBreakdown = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            { $match: { 'product.vendor_id': new mongoose.Types.ObjectId(vendorId) } },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            {
                $match: {
                    'order.order_date': { $gte: new Date(today.getFullYear() - 1, today.getMonth(), 1) }
                }
            },
            {
                $group: {
                    _id: '$order._id',
                    month: { $first: { $dateToString: { format: "%Y-%m", date: "$order.order_date" } } },
                    subtotal: { $first: '$order.subtotal' },
                    orderCount: { $first: 1 }
                }
            },
            {
                $group: {
                    _id: '$month',
                    total_sales: { $sum: { $multiply: ['$subtotal', 0.92] } },
                    orders: { $sum: '$orderCount' }
                }
            },
            {
                $project: {
                    month: '$_id',
                    total_sales: 1,
                    orders: 1,
                    avg_order_value: { $divide: ['$total_sales', '$orders'] },
                    _id: 0
                }
            },
            { $sort: { month: -1 } }
        ]);

        res.json({
            success: true,
            metrics: {
                today_revenue: revenueMetrics.length > 0 ? revenueMetrics[0].today_revenue : 0,
                weekly_revenue: revenueMetrics.length > 0 ? revenueMetrics[0].weekly_revenue : 0,
                monthly_revenue: revenueMetrics.length > 0 ? revenueMetrics[0].monthly_revenue : 0,
                quarterly_revenue: revenueMetrics.length > 0 ? revenueMetrics[0].quarterly_revenue : 0,
                monthly_breakdown: monthlyBreakdown
            }
        });
    } catch (err) {
        console.error('Error fetching vendor revenue metrics:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getVendorProducts = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const products = await Product.aggregate([
            { $match: { vendor_id: new mongoose.Types.ObjectId(vendorId) } },
            {
                $lookup: {
                    from: 'productvariants',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            { $unwind: '$variants' },
            {
                $group: {
                    _id: '$_id',
                    product_id: { $first: '$_id' },
                    product_name: { $first: '$product_name' },
                    category: { $first: '$product_category' },
                    price: { $min: '$variants.regular_price' },
                    stock: { $sum: '$variants.stock_quantity' }
                }
            },
            {
                $project: {
                    _id: 0,
                    product_id: 1,
                    product_name: 1,
                    category: 1,
                    price: 1,
                    stock: 1
                }
            }
        ]);
        res.json({ success: true, products });
    } catch (err) {
        console.error('Error fetching vendor products:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getVendorTopCustomers = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const customers = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            { $match: { 'product.vendor_id': new mongoose.Types.ObjectId(vendorId) } },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'order.customer_id',
                    foreignField: '_id',
                    as: 'Customer'
                }
            },
            { $unwind: '$Customer' },
            {
                $group: {
                    _id: '$order._id',
                    customer_id: { $first: '$Customer._id' },
                    customer_name: { $first: '$Customer.userName' },
                    total_amount: { $first: '$order.total_amount' },
                    order_date: { $first: '$order.order_date' }
                }
            },
            {
                $group: {
                    _id: '$customer_id',
                    customer_id: { $first: '$customer_id' },
                    customer_name: { $first: '$customer_name' },
                    total_orders: { $sum: 1 },
                    total_spent: { $sum: '$total_amount' },
                    last_purchase: { $max: '$order_date' }
                }
            },
            {
                $project: {
                    _id: 0,
                    customer_id: 1,
                    customer_name: 1,
                    total_orders: 1,
                    total_spent: 1,
                    last_purchase: 1
                }
            },
            { $sort: { total_spent: -1 } },
            { $limit: 5 }
        ]);
        res.json({ success: true, customers });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findById(vendorId)
            .select('_id name email contact_number store_name store_location created_at');

        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

        res.json({
            success: true,
            vendor: {
                id: vendor._id.toString(),
                name: vendor.name,
                email: vendor.email,
                contact_number: vendor.contact_number,
                store_name: vendor.store_name,
                store_location: vendor.store_location,
                joined_date: vendor.created_at.toLocaleDateString()
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const { name, contact_number, store_name, store_location } = req.body;

        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
        if (!/^[a-zA-Z\s]+$/.test(name)) return res.status(400).json({ success: false, message: 'Name must contain only letters and spaces' });
        if (name.length < 2) return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
        if (!contact_number || !/^\+91[6-9][0-9]{9}$/.test(contact_number)) return res.status(400).json({ success: false, message: 'Phone must be a valid Indian number starting with +91' });
        if (!store_name || store_name.length < 2) return res.status(400).json({ success: false, message: 'Store name must be at least 2 characters' });
        if (!store_location || store_location.length < 5) return res.status(400).json({ success: false, message: 'Store location must be at least 5 characters' });

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

        await Vendor.updateOne(
            { _id: vendorId },
            { name, contact_number, store_name, store_location }
        );
        res.json({ success: true, message: 'Vendor updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update vendor' });
    }
};

const deleteVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

        const products = await Product.find({ vendor_id: vendorId });
        const productIds = products.map(product => product._id);

        await OrderItem.deleteMany({ product_id: { $in: productIds } });
        await ProductVariant.deleteMany({ product_id: { $in: productIds } });
        await ProductImage.deleteMany({ product_id: { $in: productIds } });
        await Product.deleteMany({ vendor_id: vendorId });
        await Vendor.deleteOne({ _id: vendorId });

        res.json({ success: true, message: 'Vendor deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getEventManagers = async (req, res) => {
    try {
        const eventManagers = await EventManager.find()
            .select('_id userName email companyName createdAt')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            eventManagers: eventManagers.map(manager => ({
                id: manager._id,
                name: manager.userName,
                email: manager.email,
                organization: manager.companyName,
                joined_date: manager.createdAt
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getEventManagerStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const lastMonthStart = new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Total Event Managers
        const total = await EventManager.countDocuments();
        const lastMonthManagers = await EventManager.countDocuments({
            createdAt: { $gte: lastMonthStart, $lt: monthAgo }
        });
        const managerGrowthPercent = lastMonthManagers > 0
            ? Math.round(((total - lastMonthManagers) / lastMonthManagers) * 100)
            : 0;

        // Total Revenue Generated (from Event Model)
        const revenueResult = await Event.aggregate([
            {
                $group: {
                    _id: null,
                    revenue: { $sum: { $multiply: ['$ticketPrice', '$tickets_sold'] } }
                }
            }
        ]);
        const revenue = revenueResult.length > 0 ? revenueResult[0].revenue : 0;

        // Revenue Last Month
        const lastMonthRevenueResult = await Event.aggregate([
            {
                $match: {
                    date_time: { $gte: lastMonthStart, $lt: monthAgo },
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: { $multiply: ['$ticketPrice', '$tickets_sold'] } }
                }
            }
        ]);
        const lastMonthRevenue = lastMonthRevenueResult.length > 0 ? lastMonthRevenueResult[0].revenue : 0;
        const revenueGrowthPercent = lastMonthRevenue > 0
            ? Math.round(((revenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : 0;

        // Total Events
        const totalEvents = await Event.countDocuments();
        const lastMonthEvents = await Event.countDocuments({
            createdAt: { $gte: lastMonthStart, $lt: monthAgo }
        });
        const eventsGrowthPercent = lastMonthEvents > 0
            ? Math.round(((totalEvents - lastMonthEvents) / lastMonthEvents) * 100)
            : 0;

        // Today's Events (by date_time)
        const todayEvents = await Event.countDocuments({
            date_time: { $gte: today, $lt: todayEnd }
        });
        const yesterdayEvents = await Event.countDocuments({
            date_time: { $gte: yesterday, $lt: today }
        });
        const todayEventsChange = todayEvents - yesterdayEvents;

        res.json({
            success: true,
            stats: {
                total,
                revenue,
                totalEvents,
                todayEvents,
                managerGrowthPercent,
                revenueGrowthPercent,
                eventsGrowthPercent,
                todayEventsChange
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getTotalEvents = async (req, res) => {
    try {
        const total = await Event.countDocuments();
        res.json({ success: true, total: total || 0 });
    } catch (err) {
        console.error('Error fetching total events:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getEventManager = async (req, res) => {
    try {
        const managerId = req.params.id;
        const manager = await EventManager.findById(managerId);
        if (!manager) return res.status(404).json({ success: false, message: 'Event Manager not found' });

        const imageBase64 = manager.profilePic || null;

        res.json({
            success: true,
            manager: {
                id: manager._id.toString(),
                name: manager.userName,
                email: manager.email,
                organization: manager.companyName,
                phone: manager.phoneNumber,
                joined_date: manager.createdAt,
                image: imageBase64
            }
        });
    } catch (err) {
        console.error('Error in getEventManager:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getEventManagerMetrics = async (req, res) => {
    try {
        const managerId = req.params.id;
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [upcoming, weekly, monthly, monthlyBreakdown] = await Promise.all([
            Event.countDocuments({ eventManagerId: managerId, date_time: { $gte: now } }),
            Event.countDocuments({ eventManagerId: managerId, date_time: { $gte: weekAgo } }),
            Event.countDocuments({ eventManagerId: managerId, date_time: { $gte: monthAgo } }),
            Event.aggregate([
                { $match: { eventManagerId: new mongoose.Types.ObjectId(managerId) } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$date_time" } },
                        total_events: { $sum: 1 },
                        attendees: { $sum: "$tickets_sold" },
                        revenue: { $sum: { $multiply: ["$tickets_sold", "$ticketPrice"] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        month: "$_id",
                        total_events: 1,
                        attendees: 1,
                        avg_attendance: { $divide: ["$attendees", "$total_events"] },
                        totalRevenue: "$revenue"
                    }
                },
                { $sort: { month: -1 } },
                { $limit: 6 }
            ])
        ]);

        const totalRevenueResult = await Event.aggregate([
            { $match: { eventManagerId: new mongoose.Types.ObjectId(managerId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: { $multiply: ["$tickets_sold", "$ticketPrice"] } }
                }
            }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total * 0.94 : 0;

        res.json({
            success: true,
            metrics: {
                upcoming,
                weekly,
                monthly,
                monthly_breakdown: monthlyBreakdown,
                totalRevenue: totalRevenue.toFixed(2)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getUpcomingEvents = async (req, res) => {
    try {
        const managerId = req.params.id;
        const now = new Date();
        const events = await Event.find({ eventManagerId: managerId, date_time: { $gte: now } })
            .select('_id title date_time venue total_tickets tickets_sold')
            .sort({ date_time: 1 })
            .limit(10);

        res.json({
            success: true,
            events: events.map(event => ({
                event_id: event._id.toString(),
                event_name: event.title,
                date: event.date_time,
                location: event.venue,
                total_tickets: event.total_tickets,
                tickets_sold: event.tickets_sold,
                status: event.date_time > now ? 'Upcoming' : 'Ongoing'
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getPastEvents = async (req, res) => {
    try {
        const managerId = req.params.id;
        const now = new Date();
        const events = await Event.find({ eventManagerId: managerId, date_time: { $lt: now } })
            .select('_id title date_time tickets_sold')
            .sort({ date_time: -1 })
            .limit(10);

        res.json({
            success: true,
            events: events.map(event => ({
                event_id: event._id.toString(),
                event_name: event.title,
                date: event.date_time,
                attendees: event.tickets_sold
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateEventManager = async (req, res) => {
    try {
        const managerId = req.params.id;
        const { userName, email, phoneNumber, companyName } = req.body;
        const profilePicFile = req.file; // File from multer middleware

        if (!userName || userName.length < 2) return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Invalid email' });
        if (phoneNumber && !/^\+91[6-9][0-9]{9}$/.test(phoneNumber)) return res.status(400).json({ success: false, message: 'Invalid phone number' });
        if (companyName && companyName.length < 3) return res.status(400).json({ success: false, message: 'Organization must be at least 3 characters' });

        const manager = await EventManager.findById(managerId);
        if (!manager) return res.status(404).json({ success: false, message: 'Event Manager not found' });

        const updateData = { userName, email };
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber || null;
        if (companyName !== undefined) updateData.companyName = companyName || null;

        // --- CLOUDINARY INTEGRATION: Profile Picture ---
        if (profilePicFile) {
            try {
                const imageUrl = await uploadToCloudinary(profilePicFile, 'event_manager_profiles', [{ width: 200, height: 200, crop: 'thumb' }]);
                updateData.profilePic = imageUrl;
            } catch (error) {
                console.error("Cloudinary upload failed for profile pic:", error);
                return res.status(500).json({ success: false, message: 'Failed to upload profile picture.' });
            }
        }
        // ------------------------------------------------

        await EventManager.updateOne(
            { _id: managerId },
            updateData
        );
        res.json({ success: true, message: 'Event Manager updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update event manager' });
    }
};

const deleteEventManager = async (req, res) => {
    try {
        const managerId = req.params.id;
        const manager = await EventManager.findById(managerId);
        if (!manager) return res.status(404).json({ success: false, message: 'Event Manager not found' });

        // Delete associated events and tickets
        const events = await Event.find({ eventManagerId: managerId });
        const eventIds = events.map(e => e._id);

        await Ticket.deleteMany({ eventId: { $in: eventIds } }); // Use Ticket model
        await Event.deleteMany({ eventManagerId: managerId });

        await EventManager.deleteOne({ _id: managerId });
        res.json({ success: true, message: 'Event Manager deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete event manager' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        await OrderItem.deleteMany({ product_id: productId });
        await ProductVariant.deleteMany({ product_id: productId });
        await ProductImage.deleteMany({ product_id: productId });
        await Product.deleteOne({ _id: productId });

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const addProduct = async (req, res) => {
    try {
        const {
            product_name,
            product_category,
            product_type,
            stock_status,
            product_description,
            variants
        } = req.body;

        if (!product_name || !product_category || !product_type || !stock_status || !product_description || !variants) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        const defaultVendor = await Vendor.findOne();
        if (!defaultVendor) {
            return res.status(404).json({ success: false, message: 'No vendors available. Please add a vendor first.' });
        }

        const product = new Product({
            vendor_id: defaultVendor._id,
            product_name,
            product_category,
            product_type,
            product_description,
            stock_status,
            created_at: new Date()
        });

        const savedProduct = await product.save();

        const parsedVariants = Array.isArray(variants) ? variants : JSON.parse(variants);
        for (const variant of parsedVariants) {
            const productVariant = new ProductVariant({
                product_id: savedProduct._id,
                size: variant.size || null,
                color: variant.color || null,
                regular_price: parseFloat(variant.regular_price),
                sale_price: variant.sale_price ? parseFloat(variant.sale_price) : null,
                stock_quantity: parseInt(variant.stock_quantity),
                sku: variant.sku || null
            });
            await productVariant.save();
        }

        // --- CLOUDINARY INTEGRATION: Product Images ---
        if (req.files && req.files.length > 0) {
            for (const [index, file] of req.files.entries()) {
                let imageUrl;
                try {
                    imageUrl = await uploadToCloudinary(file, 'product_images', [{ width: 800, height: 600, crop: 'limit' }]);
                } catch (error) {
                    console.error("Cloudinary upload failed for product image:", error);
                    // Continue if one image fails, but log the error.
                    continue;
                }

                const productImage = new ProductImage({
                    product_id: savedProduct._id,
                    image_data: imageUrl,
                    is_primary: index === 0
                });
                await productImage.save();
            }
        }
        // ------------------------------------------------

        res.json({
            success: true,
            message: 'Product added successfully',
            redirect: '/admin-products'
        });
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ success: false, message: 'Failed to add product' });
    }
};

const getProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const variants = await ProductVariant.find({ product_id: productId });
        const images = await ProductImage.find({ product_id: productId });

        res.json({
            success: true,
            product: {
                id: product._id,
                product_name: product.product_name,
                product_category: product.product_category,
                product_type: product.product_type,
                stock_status: product.stock_status,
                product_description: product.product_description,
                variants: variants.map(v => ({
                    size: v.size,
                    color: v.color,
                    regular_price: v.regular_price,
                    sale_price: v.sale_price,
                    stock_quantity: v.stock_quantity,
                    sku: v.sku
                })),
                images: images.map(img => ({
                    image_data: img.image_data,
                    is_primary: img.is_primary,
                }))
            }
        });
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const {
            product_name,
            product_category,
            product_type,
            stock_status,
            product_description,
            variants
        } = req.body;

        if (!product_name || !product_category || !product_type || !stock_status || !product_description || !variants) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await Product.updateOne(
            { _id: productId },
            {
                product_name,
                product_category,
                product_type,
                stock_status,
                product_description
            }
        );

        await ProductVariant.deleteMany({ product_id: productId });
        await ProductImage.deleteMany({ product_id: productId });

        let parsedVariants;
        try {
            parsedVariants = Array.isArray(variants) ? variants : JSON.parse(variants);
            if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
                return res.status(400).json({ success: false, message: 'At least one variant is required' });
            }
        } catch (err) {
            console.log('Error parsing variants:', err);
            return res.status(400).json({ success: false, message: 'Invalid variants data' });
        }
        for (const variant of parsedVariants) {
            const productVariant = new ProductVariant({
                product_id: productId,
                size: variant.size || null,
                color: variant.color || null,
                regular_price: parseFloat(variant.regular_price),
                sale_price: variant.sale_price ? parseFloat(variant.sale_price) : null,
                stock_quantity: parseInt(variant.stock_quantity),
                sku: variant.sku || null
            });
            await productVariant.save();
        }

        // --- CLOUDINARY INTEGRATION: Product Images ---
        if (req.files && req.files.length > 0) {
            for (const [index, file] of req.files.entries()) {
                let imageUrl;
                try {
                    imageUrl = await uploadToCloudinary(file, 'product_images', [{ width: 800, height: 600, crop: 'limit' }]);
                } catch (error) {
                    console.error("Cloudinary upload failed for product image:", error);
                    continue;
                }

                const productImage = new ProductImage({
                    product_id: productId,
                    image_data: imageUrl,
                    is_primary: index === 0
                });
                await productImage.save();
            }
        }
        // ------------------------------------------------

        res.json({
            success: true,
            message: 'Product updated successfully',
            redirect: '/admin-products'
        });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
};
const logout = (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ success: true, message: 'Logged out successfully' });
};
const getEventsData = async (req, res) => {
    try {
        const [
            totalEvents,
            ticketAggregation,
            events
        ] = await Promise.all([
            Event.countDocuments(),
            // Use Ticket model to count total tickets sold (numberOfTickets field)
            Ticket.aggregate([
                { $group: { _id: null, totalTickets: { $sum: '$numberOfTickets' } } }
            ]),
            Event.find({})
                .populate({
                    path: 'eventManagerId',
                    model: 'EventManager',
                    select: 'userName'
                })
                .sort({ date_time: -1 })
        ]);

        const ticketsSold = ticketAggregation.length > 0 ? ticketAggregation[0].totalTickets : 0;

        // NOTE: Removed upcomingEvents and completedEvents since the Event model lacks a status field.
        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalEvents,
                    ticketsSold
                },
                events: events.map(event => ({
                    id: event._id,
                    title: event.title,
                    date_time: event.date_time,
                    venue: event.venue,
                    total_tickets: event.total_tickets,
                    tickets_sold: event.tickets_sold,
                    managerName: event.eventManagerId ? event.eventManagerId.userName : 'N/A'
                }))
            }
        });

    } catch (error) {
        console.error('Error fetching event management data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found.' });
        }

        // Delete all tickets associated with this event to maintain data integrity
        await Ticket.deleteMany({ eventId: id });

        await Event.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Event and all associated tickets deleted successfully.'
        });

    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const getEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId).populate('eventManagerId', 'userName');
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        const thumbnail = event.images ? event.images.thumbnail : null;
        const banner = event.images ? event.images.banner : null;

        res.json({
            success: true,
            event: {
                id: event._id.toString(),
                name: event.title,
                about: event.description,
                language: event.language,
                duration: event.duration,
                ticket_price: event.ticketPrice,
                age_limit: event.ageLimit,
                instructions: null, // Missing in model
                venue: event.venue,
                terms: null, // Missing in model
                category: event.category,
                date_time: event.date_time,
                status: event.date_time > new Date() ? 'Upcoming' : 'Past',
                total_tickets: event.total_tickets,
                tickets_sold: event.tickets_sold,
                location: event.location,
                contact_number: event.phoneNumber || null, // Assuming 'phoneNumber' is used for contact
                image_thumbnail: thumbnail,
                image_banner: banner,
                created_at: event.createdAt,
                manager: event.eventManagerId ? { name: event.eventManagerId.userName } : null
            }
        });
    } catch (err) {
        console.error('Error in getEvent:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getEventAttendees = async (req, res) => {
    try {
        const eventId = req.params.id;
        // Use Ticket model and populate Customer details
        const attendees = await Ticket.find({ eventId: eventId })
            .populate('customerId', 'userName email phoneNumber address')
            .select('_id ticketId numberOfTickets purchaseDate status price petName petBreed petAge');

        res.json({
            success: true,
            attendees: attendees.map(att => {
                const customer = att.customerId;
                // If the customer data is null (deleted customer), use pet/ticket data where possible
                const customerName = customer ? customer.userName : 'N/A';
                const customerEmail = customer ? customer.email : 'N/A';
                const customerPhone = customer ? customer.phoneNumber : 'N/A';
                const customerAddress = customer && customer.address ?
                    `${customer.address.houseNumber || ''}, ${customer.address.city || ''}`.trim().replace(/,\s*,\s*/g, ', ').replace(/^,\s*|,\s*$/g, '')
                    : 'N/A';

                return {
                    id: att._id.toString(),
                    ticketId: att.ticketId || 'N/A',
                    name: customerName,
                    phone: customerPhone,
                    email: customerEmail,
                    address: customerAddress,
                    seats: att.numberOfTickets,
                    // Use pet fields from the Ticket model
                    with_pet: att.petName ? 'Yes' : 'No',
                    pet_name: att.petName || 'N/A',
                    pet_breed: att.petBreed || 'N/A',
                    pet_age: att.petAge || 'N/A',
                    registration_date: new Date(att.purchaseDate).toLocaleDateString(),
                    Customer: customer ? {
                        name: customer.userName,
                        email: customer.email,
                        phone: customer.phoneNumber
                    } : null
                }
            })
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const {
            title, description, language, duration, ticketPrice,
            ageLimit, venue, category, date_time,
            total_tickets, location, phoneNumber,
            existing_thumbnail, existing_banner
        } = req.body;

        // Files from multer for thumbnail (req.files.thumbnail[0]) and banner (req.files.banner[0])
        const thumbnailFile = req.files && req.files['thumbnail'] ? req.files['thumbnail'][0] : null;
        const bannerFile = req.files && req.files['banner'] ? req.files['banner'][0] : null;

        // Validation... (omitted for brevity, assume the previous checks pass)

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

        const updateData = {
            title, description, language, duration, ticketPrice,
            ageLimit, venue, category, date_time,
            total_tickets, location, phoneNumber
        };

        // --- CLOUDINARY INTEGRATION: Event Images (Thumbnail & Banner) ---
        // Handle Thumbnail
        let finalThumbnail = existing_thumbnail || (event.images ? event.images.thumbnail : null);
        if (thumbnailFile) {
            try {
                finalThumbnail = await uploadToCloudinary(thumbnailFile, 'event_thumbnails', [{ width: 400, height: 300, crop: 'fill' }]);
            } catch (error) {
                console.error("Cloudinary upload failed for thumbnail:", error);
                return res.status(500).json({ success: false, message: 'Failed to upload event thumbnail.' });
            }
        }

        // Handle Banner
        let finalBanner = existing_banner || (event.images ? event.images.banner : null);
        if (bannerFile) {
            try {
                finalBanner = await uploadToCloudinary(bannerFile, 'event_banners', [{ width: 1200, height: 400, crop: 'fill' }]);
            } catch (error) {
                console.error("Cloudinary upload failed for banner:", error);
                return res.status(500).json({ success: false, message: 'Failed to upload event banner.' });
            }
        }

        updateData.images = {
            thumbnail: finalThumbnail,
            banner: finalBanner
        };
        await Event.updateOne(
            { _id: eventId },
            updateData
        );
        res.json({ success: true, message: 'Event updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update event' });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.aggregate([
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customer_id',
                    foreignField: '_id',
                    as: 'customer_details'
                }
            },
            { $unwind: '$customer_details' },
            {
                $project: {
                    _id: 0,
                    orderId: '$_id',
                    customerName: '$customer_details.userName',
                    orderDate: '$order_date',
                    totalAmount: '$total_amount',
                    status: '$status'
                }
            },
            { $sort: { orderDate: -1 } }
        ]);
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId).populate('customer_id');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const customer = order.customer_id;

        const customerAddress = customer && customer.address ?
            `${customer.address.houseNumber || ''}, ${customer.address.streetNo || ''}, ${customer.address.city || ''} - ${customer.address.pincode || ''}`.trim().replace(/,\s*,\s*/g, ', ').replace(/^,\s*|,\s*$/g, '')
            : 'N/A';

        const orderItems = await OrderItem.find({ order_id: orderId })
            .populate({
                path: 'product_id',
                model: 'Product',
                populate: {
                    path: 'vendor_id',
                    model: 'Vendor'
                }
            });

        res.json({
            success: true,
            order: {
                orderId: order._id,
                status: order.status,
                orderDate: order.order_date,
                totalAmount: order.total_amount,
                paymentMethod: 'Credit Card',
                paymentLastFour: order.payment_last_four || 'N/A',
                customer: {
                    name: customer ? customer.userName : 'N/A',
                    email: customer ? customer.email : 'N/A',
                    phone: customer ? customer.phoneNumber || 'N/A' : 'N/A',
                    address: customerAddress
                },
                items: orderItems.map(item => ({
                    productId: item.product_id ? item.product_id._id : 'N/A',
                    productName: item.product_id ? item.product_id.product_name : item.product_name,
                    vendorName: item.product_id && item.product_id.vendor_id ? item.product_id.vendor_id.store_name : 'N/A',
                    price: item.price,
                    quantity: item.quantity
                }))
            }
        });
    } catch (error) {
        console.error('Error in getOrderDetails:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getOrderStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const totalOrders = await Order.countDocuments();
        const monthlyOrders = await Order.countDocuments({ order_date: { $gte: monthStart } });
        const weeklyOrders = await Order.countDocuments({ order_date: { $gte: weekStart } });
        const dailyOrders = await Order.countDocuments({ order_date: { $gte: today } });

        res.json({
            success: true,
            stats: {
                totalOrders,
                monthlyOrders,
                weeklyOrders,
                dailyOrders,
            }
        });
    } catch (err) {
        console.error('Error fetching order stats:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getEventRevenue = async (req, res) => {
    try {
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Total revenue all time (10% of total ticket price)
        const totalAgg = await Ticket.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$price' }
                }
            }
        ]);
        const totalSales = totalAgg.length > 0 ? totalAgg[0].totalSales : 0;
        const totalRevenue = totalSales * 0.1;

        // This month's sales (for change calculation)
        const thisMonthAgg = await Ticket.aggregate([
            { $match: { purchaseDate: { $gte: thisMonthStart } } },
            {
                $group: {
                    _id: null,
                    thisMonthSales: { $sum: '$price' }
                }
            }
        ]);
        const thisMonthSales = thisMonthAgg.length > 0 ? thisMonthAgg[0].thisMonthSales : 0;

        // Last month's sales (for change calculation)
        const lastMonthAgg = await Ticket.aggregate([
            { $match: { purchaseDate: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
            {
                $group: {
                    _id: null,
                    lastMonthSales: { $sum: '$price' }
                }
            }
        ]);
        const lastMonthSales = lastMonthAgg.length > 0 ? lastMonthAgg[0].lastMonthSales : 0;

        // Calculate percentage change
        let change = 0;
        if (lastMonthSales > 0) {
            change = ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100;
        } else if (thisMonthSales > 0) {
            change = 100; // Treat as 100% growth if last month was zero
        }
        const changeStr = (change > 0 ? '+' : '') + change.toFixed(0) + '%';

        res.json({
            success: true,
            revenue: totalRevenue.toFixed(2),
            change: changeStr
        });
    } catch (err) {
        console.error('Error calculating event revenue:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
export {
    // admin-login.ejs
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
};