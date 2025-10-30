// backend/src/controller/productController.js

import { Product, ProductVariant, ProductImage } from '../models/productsModel.js';
import Customer from '../models/customerModel.js';
import { Order, OrderItem } from '../models/orderModel.js';       // Added .js
import multer from 'multer';                                    // Convert to import
import path from 'path';                                        // Convert to import
import mongoose from 'mongoose';                                // Convert to import
import uploadToCloudinary from '../utils/cloudinaryUploader.js';
const JWT_SECRET = process.env.JWT_SECRET;

// --- getPetAccessories (UPDATED) ---
const getPetAccessories = async (req, res) => {
    try {
        console.log("Fetching pet accessories..."); // Log start

        const products = await Product.aggregate([
            {
                $lookup: {
                    from: 'productvariants', // Ensure collection name matches MongoDB (usually lowercase, plural)
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            {
                $lookup: {
                    from: 'productimages', // Ensure collection name matches MongoDB
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'images'
                }
            },
            // Add a field containing only the primary image(s)
            {
                $addFields: {
                    primaryImage: {
                        $filter: {
                            input: "$images",
                            as: "image",
                            cond: { $eq: [ "$$image.is_primary", true ] }
                        }
                    }
                }
            },
            {
                 // Unwind the primaryImage array (should have 0 or 1 element)
                 // This makes accessing the primary image data easier in $project
                $unwind: {
                    path: '$primaryImage',
                    preserveNullAndEmptyArrays: true // Keep products even if they have no primary image
                }
            },
            {
                $project: {
                    // Project fields for the frontend
                    id: { $toString: '$_id' },
                    product_name: 1,
                    // Handle potential null/missing product_type safely
                    product_type: { $ifNull: [ { $toLower: { $trim: { input: '$product_type' } } }, "unknown" ] },
                    product_category: 1, // Keep category if needed
                    variants: {
                        // Map variants to desired structure, handle nulls
                        $map: {
                            input: '$variants',
                            as: 'variant',
                            in: {
                                variant_id: { $toString: '$$variant._id'}, // Include variant ID
                                size: { $ifNull: [ { $toLower: { $trim: { input: '$$variant.size' } } }, null ] },
                                color: { $ifNull: [ { $toLower: { $trim: { input: '$$variant.color' } } }, null ] },
                                regular_price: '$$variant.regular_price',
                                sale_price: '$$variant.sale_price',
                                stock_quantity: '$$variant.stock_quantity' // Include stock
                            }
                        }
                    },
                    // Access the primary image data from the unwound field
                    image_data: '$primaryImage.image_data', // Defaults to null if no primary image found/unwound
                    created_at: 1, // Keep created_at if you sort by it
                    _id: 0 // Exclude the default _id
                }
            },
            { $sort: { created_at: -1 } } // Sort requires created_at to be included in $project
        ]);
        console.log(`Found ${products.length} products after aggregation.`); // Log count

        // --- Fetch Filters (Ensure these are awaited) ---
        console.log("Fetching filters..."); // Log filter fetching start
        const productTypesRaw = await Product.aggregate([ // Added await
            { $match: { product_type: { $ne: null, $ne: "" } } }, // Exclude null/empty strings
            { $group: { _id: { $toLower: { $trim: { input: '$product_type' } } } } },
            { $project: { _id: 0, product_type: '$_id' } }
        ]);
        const productTypes = productTypesRaw.map(item => item.product_type).sort();

        const colorsRaw = await ProductVariant.aggregate([ // Added await
            { $match: { color: { $ne: null, $ne: "" } } }, // Exclude null/empty strings
            { $group: { _id: { $toLower: { $trim: { input: '$color' } } } } },
            { $project: { _id: 0, color: '$_id' } }
        ]);
        const colors = colorsRaw.map(item => item.color).sort();

        const sizesRaw = await ProductVariant.aggregate([
            { $match: { size: { $ne: null } } },
            {
                $group: {
                    _id: { $toLower: { $trim: { input: '$size' } } }
                }
            },
            {
                $project: {
                    _id: 0,
                    size: '$_id'
                }
            }
        ]);
        const sizes = sizesRaw.map(item => item.size).sort();

        // Use aggregate to find max price for consistency and better null handling
        const maxPriceResult = await ProductVariant.aggregate([ // Added await
             { $match: { regular_price: { $ne: null } } }, // Ensure price exists
             { $sort: { regular_price: -1 } },
             { $limit: 1 },
             { $project: { _id: 0, regular_price: 1 } }
        ]);
        // Provide a default maxPrice if no variants with prices exist
        const maxPrice = maxPriceResult.length > 0 ? maxPriceResult[0].regular_price : 15000;
        console.log("Filters fetched:", { productTypes, colors, sizes, maxPrice }); // Log fetched filters

        const filters = { productTypes, colors, sizes, maxPrice };

        return res.json({
            success: true,
            products: products || [], // Ensure products is always an array
            filters,
            // Pass user if this route is protected, otherwise remove/comment out
            // user: req.user || null
        });
    } catch (err) {
        // Log the full error object for detailed debugging
        console.error("!!! Error in getPetAccessories:", err);
        // Send a more informative error response during development
        return res.status(500).json({
             success: false,
             message: 'Server error fetching pet accessories.',
             error: err.message // Include the actual error message
        });
    }
};

// --- getProduct (UPDATED) ---
const getProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        // Fetch product details
        const product = await Product.findById(productId)
            .select('id product_name product_type product_category product_description');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const variants = await ProductVariant.find({ product_id: productId })
            .select('id size color regular_price sale_price stock_quantity');
        const image = await ProductImage.findOne({ product_id: productId, is_primary: true })
            .select('image_data');

        const productData = {
            id: product._id.toString(),
            product_name: product.product_name,
            product_type: product.product_type,
            product_category: product.product_category,
            product_description: product.product_description,
            variants: variants.map(v => ({
                variant_id: v._id, // Send variant _id
                size: v.size,
                color: v.color,
                regular_price: v.regular_price,
                sale_price: v.sale_price,
                stock_quantity: v.stock_quantity
            })),
            image_data: image ? image.image_data : null
        };

        // **REMOVED** the line accessing req.session.user
        return res.json({
            success: true,
            product: productData,
        });

    } catch (err) {
        console.error("Error fetching product:", err); // Log the specific error
        return res.status(500).json({ success: false, message: 'Server error fetching product details.' });
    }
};

// --- checkout (UPDATED) ---
const checkout = async (req, res) => {
    try {
        // Check for required user profile fields
        const customerID = req.user.customerId;

        const customer = await Customer.findById(customerID);
        if (!customer) {
            return res.status(404).json({ message: "User not found" })
        }
        if (!customer.userName || !customer.ema || !customer.phoneNumber || !customer.address) {
            return res.status(400).json({
                success: false,
                message: 'Please complete your profile information before proceeding to checkout.'
            });
        }

        const { cart } = req.body;

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Clean and validate cart items
        const cleanCart = cart.map(item => ({
            product_id: item.product_id || null,
            variant_id: item.variant_id || null, // Ensure variant_id is included
            product_name: item.product_name,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0,
            size: item.size || null,
            color: item.color || null
        }));

        // Validate cart items have required fields
        const invalidItems = cleanCart.filter(item =>
            !item.product_id || !item.product_name || item.quantity <= 0 || item.price <= 0
        );

        if (invalidItems.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid cart items detected'
            });
        }

        // Calculate totals
        const subtotal = cleanCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const charge = subtotal * 0.04; // Consider making tax/charge rate configurable
        const total = subtotal + charge;

        const orderTotals = {
            subtotal, charge, total
        }

        const payload = {
            customerId: customerId,
            orderTotals: orderTotals,
            cleanCart: cleanCart
        };

        const checkoutToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '15m'
        });

        // 2. 🍪 Set the JWT in an HTTP-only Cookie
        // The maxAge should match the token expiry (15 minutes * 60 seconds * 1000 ms)
        res.cookie('checkout_session', checkoutToken, {
            httpOnly: true, // Crucial for security (prevents client-side JS access)
            secure: process.env.NODE_ENV === 'production', // Use 'secure: true' in production (requires HTTPS)
            maxAge: 15 * 60 * 1000,
            sameSite: 'Lax' // Recommended setting for CSRF mitigation
        });

        return res.json({
            success: true,
            redirectUrl: '/payment',
        });
    } catch (err) {
        console.error('Checkout error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error during checkout'
        });
    }
};


// --- processPayment (UPDATED) ---
const processPayment = async (req, res) => {
    try {

        const { cardNumber, expiryDate, cvv } = req.body;

        if (!checkoutToken) {
            return res.status(401).json({ message: 'Checkout session expired or missing token.' });
        }

        let orderTotals;
        let cleanCart;
        let customerID;

        try {
            // 2. JWT Verification and extraction
            const decoded = jwt.verify(checkoutToken, JWT_SECRET);

            orderTotals = decoded.orderTotals;
            cleanCart = decoded.cleanCart;
            customerID = decoded.customerId;

        } catch (err) {
            console.error('JWT validation failed:', err.message);
            // Clear the invalid cookie
            res.clearCookie('checkout_session');
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired checkout session. Please start checkout again.'
            });
        }

        // Validate all required data
        if (!cart || !orderTotals || !cardNumber) {
            console.error('Missing values');
            return res.status(400).json({
                success: false,
                message: 'Unable to fetch Cart'
            });
        }

        // Basic card validation (Add more robust validation as needed)
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length !== 16 || isNaN(cleanCardNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid card number'
            });
        }
        // Add expiry (MM/YY format, future date) and CVC (3-4 digits) validation here

        const paymentLastFour = cleanCardNumber.slice(-4);

        // --- Database Transaction ---
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Create Order document
            const order = await Order.create([{
                customer_id: req.user.customerId,
                order_date: new Date(),
                status: 'Pending', // Or 'Processing'
                subtotal: orderTotals.subtotal,
                total_amount: orderTotals.total,
                payment_last_four: paymentLastFour
                // Add shipping address details here if needed
            }], { session });

            // Create OrderItem documents
            const orderItems = cart.map(item => ({
                order_id: order[0]._id,
                product_id: item.product_id, // Already validated in checkout
                variant_id: item.variant_id, // Already validated in checkout
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price, // Price at the time of order
                size: item.size,
                color: item.color
            }));
            await OrderItem.insertMany(orderItems, { session });

            // TODO: Update product variant stock quantity
            // Important: Handle potential race conditions and errors robustly
            for (const item of cart) {
                const updateResult = await ProductVariant.updateOne(
                    { _id: item.variant_id, stock_quantity: { $gte: item.quantity } }, // Ensure enough stock
                    { $inc: { stock_quantity: -item.quantity } },
                    { session }
                );
                // If updateResult.modifiedCount is 0, it means stock was insufficient or variant not found
                if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
                     throw new Error(`Insufficient stock for variant ${item.variant_id} (${item.product_name})`);
                }
            }

            // Commit transaction
            await session.commitTransaction();
            return res.json({
                success: true,
                redirectUrl: '/my_orders'
            });
        } catch (transactionError) {
            await session.abortTransaction();
            console.error('Transaction Error during payment:', transactionError); // Log transaction error
            // Send specific error message if it's related to stock
            const errorMessage = transactionError.message.includes('Insufficient stock')
                ? transactionError.message
                : 'Failed to process payment due to a server error.';
            return res.status(400).json({ success: false, message: errorMessage }); // Use 400 for stock issues
        } finally {
            session.endSession();
        }
        // --- End Transaction ---

    } catch (err) {
        console.error('Payment processing error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error processing payment. Please try again.'
        });
    }
};

// --- getUserOrders (UPDATED) ---
const getUserOrders = async (req, res) => {
    
    try {
        const orders = await Order.find({ customer_id: req.user.customerId})
            .sort({ order_date: -1 })
            .lean(); // Use .lean() for plain JS objects

        if (!orders || orders.length === 0) {
            return res.json({ success: true, orders: [] }); // Return empty array if no orders
        }

        // Populate items with images
        const populatedOrders = await Promise.all(orders.map(async order => {
            const items = await OrderItem.find({ order_id: order._id }).lean();
            const detailedItems = await Promise.all(items.map(async item => {
                // Ensure item.product_id exists before querying ProductImage
                let imageData = '/images/default-product.jpg'; // Default image
                if (item.product_id) {
                    const imageDoc = await ProductImage.findOne({
                        product_id: item.product_id,
                        is_primary: true
                    }).select('image_data').lean(); // Add lean() here too
                    imageData = imageDoc?.image_data || imageData; // Use default if no image found
                }
                return {
                    ...item,
                    image_data: imageDoc?.image_data
                };
            }));
            return {
                ...order,
                id: order._id.toString(), // Ensure order ID is string
                items: detailedItems
            };
        }));

        res.json({ success: true, orders: populatedOrders });
    } catch (error) {
        console.error("Error fetching user orders:", error); // Log specific error
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

// --- reorder (UPDATED) ---
const reorder = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Verify the order belongs to the current user
        const order = await Order.findOne({ _id: orderId, user_id: req.user.customerId }).lean(); // Use lean
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or access denied' });
        }

        const items = await OrderItem.find({ order_id: orderId }).lean();
        if (items.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
        // Get product images for each item
        const cartItems = await Promise.all(items.map(async (item) => {
            const imageDoc = await ProductImage.findOne({
                product_id: item.product_id,
                is_primary: true
            });
            return {
                // Use original order details for reorder cart
                product_id: item.product_id ? item.product_id.toString() : null,
                variant_id: item.variant_id ? item.variant_id.toString() : null,
                product_name: item.product_name,
                quantity: item.quantity,
                // Price might need to be re-fetched if prices change, or use original price
                price: item.price, // Using original price for simplicity
                size: item.size || null,
                color: item.color || null,
                image_data: imageData
                // Add current_stock: currentVariant?.stock_quantity if fetched
            };
        }));
        res.json({ success: true, cart: cartItems });
    } catch (err) {
        console.error('Reorder error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch order items for reorder' });
    }
};
export {
    getPetAccessories,
    getProduct,
    checkout,
    processPayment,
    getUserOrders,
    reorder,
};