// backend/src/controller/productController.js

import { Product, ProductVariant, ProductImage } from '../models/productsModel.js';
import Customer from '../models/customerModel.js';
import { Order, OrderItem } from '../models/orderModel.js';       // Added .js
import jwt from 'jsonwebtoken'; // UPDATED: Import jwt
import mongoose from 'mongoose';                                
import uploadToCloudinary from '../utils/cloudinaryUploader.js';
// REMOVED: const JWT_SECRET = process.env.JWT_SECRET_KEY; 

// --- getPetAccessories (UPDATED) ---
const getPetAccessories = async (req, res) => {
    try {
        console.log("Fetching pet accessories..."); 

        const products = await Product.aggregate([
            {
                $lookup: {
                    from: 'productvariants', 
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'variants'
                }
            },
            {
                $lookup: {
                    from: 'productimages', 
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'images'
                }
            },
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
                $unwind: {
                    path: '$primaryImage',
                    preserveNullAndEmptyArrays: true 
                }
            },
            {
                $project: {
                    id: { $toString: '$_id' },
                    product_name: 1,
                    product_type: { $ifNull: [ { $toLower: { $trim: { input: '$product_type' } } }, "unknown" ] },
                    product_category: 1, 
                    variants: {
                        $map: {
                            input: '$variants',
                            as: 'variant',
                            in: {
                                variant_id: { $toString: '$$variant._id'}, 
                                size: { $ifNull: [ { $toLower: { $trim: { input: '$$variant.size' } } }, null ] },
                                color: { $ifNull: [ { $toLower: { $trim: { input: '$$variant.color' } } }, null ] },
                                regular_price: '$$variant.regular_price',
                                sale_price: '$$variant.sale_price',
                                stock_quantity: '$$variant.stock_quantity' 
                            }
                        }
                    },
                    image_data: '$primaryImage.image_data', 
                    created_at: 1, 
                    _id: 0 
                }
            },
            { $sort: { created_at: -1 } } 
        ]);
        console.log(`Found ${products.length} products after aggregation.`); 

        // --- Fetch Filters (Ensure these are awaited) ---
        console.log("Fetching filters..."); 
        const productTypesRaw = await Product.aggregate([ 
            { $match: { product_type: { $ne: null, $ne: "" } } }, 
            { $group: { _id: { $toLower: { $trim: { input: '$product_type' } } } } },
            { $project: { _id: 0, product_type: '$_id' } }
        ]);
        const productTypes = productTypesRaw.map(item => item.product_type).sort();

        const colorsRaw = await ProductVariant.aggregate([ 
            { $match: { color: { $ne: null, $ne: "" } } }, 
            { $group: { _id: { $toLower: { $trim: { input: '$color' } } } } },
            { $project: { _id: 0, color: '$_id' } }
        ]);
        const colors = colorsRaw.map(item => item.color).sort();

        const sizesRaw = await ProductVariant.aggregate([
            { $match: { size: { $ne: null, $ne: "" } } }, // Added not empty check
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

        const maxPriceResult = await ProductVariant.aggregate([ 
             { $match: { regular_price: { $ne: null } } }, 
             { $sort: { regular_price: -1 } },
             { $limit: 1 },
             { $project: { _id: 0, regular_price: 1 } }
        ]);
        const maxPrice = maxPriceResult.length > 0 ? maxPriceResult[0].regular_price : 15000;
        console.log("Filters fetched:", { productTypes, colors, sizes, maxPrice }); 

        const filters = { productTypes, colors, sizes, maxPrice };

        return res.json({
            success: true,
            products: products || [], 
            filters,
        });
    } catch (err) {
        console.error("!!! Error in getPetAccessories:", err);
        return res.status(500).json({
             success: false,
             message: 'Server error fetching pet accessories.',
             error: err.message 
        });
    }
};

// --- getProduct (UPDATED) ---
const getProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        
        // Validate if productId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
             return res.status(400).json({ success: false, message: 'Invalid product ID format' });
        }

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
                variant_id: v._id, 
                size: v.size,
                color: v.color,
                regular_price: v.regular_price,
                sale_price: v.sale_price,
                stock_quantity: v.stock_quantity
            })),
            image_data: image ? image.image_data : null
        };

        return res.json({
            success: true,
            product: productData,
        });

    } catch (err) {
        console.error("Error fetching product:", err); 
        return res.status(500).json({ success: false, message: 'Server error fetching product details.' });
    }
};

// --- checkout (UPDATED) ---
const checkout = async (req, res) => {
    try {
        const customerID = req.user.customerId;

        const customer = await Customer.findById(customerID);
        if (!customer) {
            return res.status(404).json({ message: "User not found" })
        }
        
        // UPDATED: Check for address object and city
        if (!customer.userName || !customer.email || !customer.phoneNumber || !customer.address || !customer.address.city) {
            return res.status(400).json({
                success: false,
                message: 'Please complete your profile information (including address) before proceeding to checkout.'
            });
        }

        const { cart } = req.body;

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        const cleanCart = cart.map(item => ({
            product_id: item.product_id || null,
            variant_id: item.variant_id || null, 
            product_name: item.product_name,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0,
            size: item.size || null,
            color: item.color || null
        }));

        const invalidItems = cleanCart.filter(item =>
            !item.product_id || !item.variant_id || !item.product_name || item.quantity <= 0 || item.price < 0 // Price can be 0 for free items
        );

        if (invalidItems.length > 0) {
            console.warn("Invalid cart items detected:", invalidItems);
            return res.status(400).json({
                success: false,
                message: 'Invalid cart items detected'
            });
        }

        const subtotal = cleanCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const charge = subtotal * 0.04; 
        const total = subtotal + charge;

        const orderTotals = {
            subtotal, charge, total
        }

        const payload = {
            customerId: customerID,
            orderTotals: orderTotals,
            cleanCart: cleanCart
        };

        // FIXED: Use process.env.JWT_SECRET_KEY directly
        const checkoutToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '15m'
        });

        res.cookie('checkout_session', checkoutToken, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 15 * 60 * 1000,
            sameSite: 'strict' 
        });

        return res.json({
            success: true,
            redirectUrl: '/payment', // You need to create this frontend route
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
        // UPDATED: Read token from cookie
        const checkoutToken = req.cookies.checkout_session;
        const { cardNumber, expiryDate, cvv } = req.body; // You would use these to call a real payment gateway

        if (!checkoutToken) {
            return res.status(401).json({ success: false, message: 'Checkout session expired or missing token.' });
        }

        let orderTotals;
        let cleanCart;
        let customerID;

        try {
            // FIXED: Use process.env.JWT_SECRET_KEY directly
            const decoded = jwt.verify(checkoutToken, process.env.JWT_SECRET_KEY);

            orderTotals = decoded.orderTotals;
            cleanCart = decoded.cleanCart; // UPDATED: Use 'cleanCart'
            customerID = decoded.customerId;

        } catch (err) {
            console.error('JWT validation failed:', err.message);
            res.clearCookie('checkout_session');
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired checkout session. Please start checkout again.'
            });
        }

        // UPDATED: Validate 'cleanCart'
        if (!cleanCart || !orderTotals || !cardNumber) {
            console.error('Missing values for payment processing');
            return res.status(400).json({
                success: false,
                message: 'Unable to fetch Cart or payment details'
            });
        }

        // Basic card validation (SIMULATION)
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
                customer_id: customerID, // Use customerID from token
                order_date: new Date(),
                status: 'Pending', 
                subtotal: orderTotals.subtotal,
                total_amount: orderTotals.total,
                payment_last_four: paymentLastFour
            }], { session });

            // Create OrderItem documents
            // UPDATED: Use 'cleanCart'
            const orderItems = cleanCart.map(item => ({
                order_id: order[0]._id,
                product_id: item.product_id, 
                variant_id: item.variant_id, 
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price, 
                size: item.size,
                color: item.color
            }));
            await OrderItem.insertMany(orderItems, { session });

            // UPDATED: Update product variant stock quantity
            for (const item of cleanCart) {
                const updateResult = await ProductVariant.updateOne(
                    { _id: item.variant_id, stock_quantity: { $gte: item.quantity } }, 
                    { $inc: { stock_quantity: -item.quantity } },
                    { session }
                );
                if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
                     throw new Error(`Insufficient stock for ${item.product_name} (${item.size || ''} ${item.color || ''})`);
                }
            }

            // Commit transaction
            await session.commitTransaction();
            
            res.clearCookie('checkout_session'); // Clear cookie on success
            
            return res.json({
                success: true,
                redirectUrl: '/my_orders'
            });
        } catch (transactionError) {
            await session.abortTransaction();
            console.error('Transaction Error during payment:', transactionError); 
            const errorMessage = transactionError.message.includes('Insufficient stock')
                ? transactionError.message
                : 'Failed to process payment due to a server error.';
            return res.status(400).json({ success: false, message: errorMessage }); 
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
            .lean(); 

        if (!orders || orders.length === 0) {
            return res.json({ success: true, orders: [] }); 
        }

        const populatedOrders = await Promise.all(orders.map(async order => {
            const items = await OrderItem.find({ order_id: order._id }).lean();
            const detailedItems = await Promise.all(items.map(async item => {
                let imageData = null; // Use null instead of path
                if (item.product_id) {
                    const imageDoc = await ProductImage.findOne({
                        product_id: item.product_id,
                        is_primary: true
                    }).select('image_data').lean(); 
                    imageData = imageDoc?.image_data || null; // Use null if no image
                }
                return {
                    ...item,
                    image_data: imageData
                };
            }));
            return {
                ...order,
                id: order._id.toString(), 
                items: detailedItems
            };
        }));

        res.json({ success: true, orders: populatedOrders });
    } catch (error) {
        console.error("Error fetching user orders:", error); 
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

// --- reorder (UPDATED) ---
const reorder = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // UPDATED: Use 'customer_id' to match schema
        const order = await Order.findOne({ _id: orderId, customer_id: req.user.customerId }).lean(); 
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or access denied' });
        }

        const items = await OrderItem.find({ order_id: orderId }).lean();
        if (items.length === 0) return res.status(404).json({ success: false, message: 'Order items not found' });
        
        const cartItems = await Promise.all(items.map(async (item) => {
            // UPDATED: Fetch image data
            let imageData = null;
            if (item.product_id) {
                 const imageDoc = await ProductImage.findOne({
                    product_id: item.product_id,
                    is_primary: true
                }).select('image_data').lean();
                imageData = imageDoc ? imageDoc.image_data : null;
            }
           
            return {
                product_id: item.product_id ? item.product_id.toString() : null,
                variant_id: item.variant_id ? item.variant_id.toString() : null,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price, 
                size: item.size || null,
                color: item.color || null,
                image_data: imageData // UPDATED: Include image data
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