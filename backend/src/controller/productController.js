// backend/src/controller/productController.js

import { Product, ProductVariant, ProductImage } from '../models/productsModel.js';
import { Order, OrderItem } from '../models/orderModel.js';
import Customer from '../models/customerModel.js'; // Import Customer model
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';

// --- Multer Configuration ---
const productImageStorage = multer.diskStorage({
    destination: 'uploads/products/',
    filename: (req, file, cb) => cb(null, `product_${Date.now()}${path.extname(file.originalname)}`)
});
const uploadProductImages = multer({
    storage: productImageStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) return cb(new Error('Only image files (jpg, jpeg, png) are allowed!'), false);
        cb(null, true);
    }
}).array('product-images', 10); // Allows up to 10 images with field name 'product-images'

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

        const sizesRaw = await ProductVariant.aggregate([ // Added await
            { $match: { size: { $ne: null, $ne: "" } } }, // Exclude null/empty strings
            { $group: { _id: { $toLower: { $trim: { input: '$size' } } } } },
            { $project: { _id: 0, size: '$_id' } }
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
        // Check user via req.user populated by protectRoute middleware
        if (!req.user || !req.user.customerId) {
            return res.status(401).json({
                success: false,
                message: 'Please login to checkout'
            });
        }

        // Fetch the customer's profile to check required fields
        const customer = await Customer.findById(req.user.customerId).select('userName email phoneNumber address');
         if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found.'
            });
         }

        // Check for required profile fields
        // Add more specific address checks if needed (e.g., customer.address.streetNo)
        if (!customer.userName || !customer.email || !customer.phoneNumber || !customer.address || !customer.address.houseNumber /* ... add other required address fields ... */ ) {
            return res.status(400).json({
                success: false,
                message: 'Please complete your profile information (Name, Email, Phone, Full Address) before proceeding to checkout.'
            });
        }

        const { cart } = req.body;

        // Validate cart
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

        const invalidItems = cleanCart.filter(item =>
            !item.product_id || !item.variant_id || !item.product_name || item.quantity <= 0 || item.price < 0 // Price can be 0 (e.g. free item), ensure variant_id exists
        );

        if (invalidItems.length > 0) {
             console.error('Invalid cart items detected:', invalidItems); // Log invalid items
            return res.status(400).json({
                success: false,
                message: 'Invalid cart items detected (missing product/variant ID, name, or invalid quantity/price).'
            });
        }

        // Calculate totals
        const subtotal = cleanCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const charge = subtotal * 0.04; // Consider making tax/charge rate configurable
        const total = subtotal + charge;

        const orderTotals = {
            subtotal: parseFloat(subtotal.toFixed(2)),
            charge: parseFloat(charge.toFixed(2)),
            total: parseFloat(total.toFixed(2))
        };

        // NOTE: Decide how to pass cart & totals to payment step.
        // Option 1: Store in session (Requires express-session middleware in server.js)
        // req.session.cart = cleanCart;
        // req.session.orderTotals = orderTotals;

        // Option 2: Send back to frontend to be passed in the payment request body
        // This is often preferred for SPAs to avoid session reliance.
        return res.json({
            success: true,
            // Send necessary data for the next step
            cart: cleanCart,
            orderTotals: orderTotals,
            redirectUrl: '/payment' // Frontend uses this to navigate
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
        // Check user via req.user
        if (!req.user || !req.user.customerId) {
            return res.status(401).json({
                success: false,
                message: 'User not logged in'
            });
        }

        // Get data from request body (assuming frontend sends card details AND cart/totals)
        const { cardNumber, expiryDate, cvc, cart, orderTotals } = req.body;

        // Validate required data
        if (!cart || !Array.isArray(cart) || cart.length === 0 || !orderTotals || !cardNumber || !expiryDate || !cvc ) {
             console.error('Missing payment data:', { /* ... log details ... */ });
            return res.status(400).json({
                success: false,
                message: 'Required payment details, cart, or order totals missing.'
            });
        }

        // Basic card validation (Add more robust validation as needed)
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cleanCardNumber)) { // Basic 16 digit check
            return res.status(400).json({ success: false, message: 'Invalid card number format' });
        }
        // Add expiry (MM/YY format, future date) and CVC (3-4 digits) validation here

        const paymentLastFour = cleanCardNumber.slice(-4);

        // --- Database Transaction ---
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Create Order document
            const order = await Order.create([{
                user_id: req.user.customerId, // Use ID from authenticated user
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

            // Clear session data if it was used
            // req.session.cart = null;
            // req.session.orderTotals = null;

            console.log(`Order ${order[0]._id} created successfully for user ${req.user.customerId}`); // Log success

            return res.json({
                success: true,
                message: 'Payment successful, order created.', // Add success message
                orderId: order[0]._id, // Send back order ID
                redirectUrl: '/my_orders' // Redirect instruction for frontend
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
        console.error('Payment processing error (outer):', err);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while processing payment.'
        });
    }
};

// --- getUserOrders (UPDATED) ---
const getUserOrders = async (req, res) => {
    // Check user via req.user
    if (!req.user || !req.user.customerId) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    try {
        // Fetch orders for the logged-in customer
        const orders = await Order.find({ user_id: req.user.customerId }) // Use ID from req.user
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
                    id: item._id.toString(), // Add item ID if needed by frontend
                    image_data: imageData
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
    // Check user via req.user
    if (!req.user || !req.user.customerId) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    try {
        const orderId = req.params.orderId;

        // Verify the order belongs to the current user
        const order = await Order.findOne({ _id: orderId, user_id: req.user.customerId }).lean(); // Use lean
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or access denied' });
        }

        const items = await OrderItem.find({ order_id: orderId }).lean();
        if (items.length === 0) return res.status(404).json({ success: false, message: 'No items found for this order' });

        // Get product images and potentially current price/stock (optional)
        const cartItems = await Promise.all(items.map(async (item) => {
            let imageData = null;
            // Fetch current variant details if needed (e.g., to check stock/price changes)
            // const currentVariant = await ProductVariant.findById(item.variant_id).lean();
            if (item.product_id) {
                const imageDoc = await ProductImage.findOne({ product_id: item.product_id, is_primary: true }).select('image_data').lean();
                imageData = imageDoc ? imageDoc.image_data : null;
            }
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

        // Send cart items back to frontend to populate the cart
        res.json({ success: true, cart: cartItems });
    } catch (err) {
        console.error('Reorder error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch order items for reorder' });
    }
};

// --- getPaymentPage (REVIEW/REMOVE) ---
const getPaymentPage = (req, res) => {
    // This endpoint is likely NOT needed for a React SPA.
    // The frontend should handle routing to its payment component.
    console.warn("GET /api/products/payment endpoint hit - consider removing if unused in SPA.");
    // If it were needed, it might fetch session data or return static info.
    res.status(404).json({ success: false, message: "Endpoint not typically used in SPA flow." });
};


// --- Exports ---
export {
    getPetAccessories,
    getProduct,
    checkout,
    processPayment,
    getUserOrders,
    reorder,
    getPaymentPage,
    // uploadProductImages // Only export if needed elsewhere
};