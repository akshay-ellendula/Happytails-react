
import { Product, ProductVariant, ProductImage } from '../models/productsModel.js';
import Customer from '../models/customerModel.js';
import { Order, OrderItem } from '../models/orderModel.js';       // Added .js
import multer from 'multer';                                    // Convert to import
import path from 'path';                                        // Convert to import
import mongoose from 'mongoose';                                // Convert to import
import uploadToCloudinary from '../utils/cloudinaryUploader.js';
const JWT_SECRET = process.env.JWT_SECRET;

const getPetAccessories = async (req, res) => {
    try {
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
                $unwind: {
                    path: '$images',
                    preserveNullAndEmptyArrays: true
                }
            },
            { $match: { 'images.is_primary': true } },
            {
                $project: {
                    id: { $toString: '$_id' },
                    product_name: 1,
                    product_type: { $toLower: { $trim: { input: '$product_type' } } }, // Normalize product_type
                    product_category: 1,
                    variants: {
                        $map: {
                            input: '$variants',
                            as: 'variant',
                            in: {
                                size: { $toLower: { $trim: { input: '$$variant.size' } } },
                                color: { $toLower: { $trim: { input: '$$variant.color' } } },
                                regular_price: '$$variant.regular_price',
                                sale_price: '$$variant.sale_price'
                            }
                        }
                    },
                    image_data: '$images.image_data',
                    _id: 0
                }
            },
            { $sort: { created_at: -1 } }
        ]);
        // Normalize product types, colors, and sizes as before
        const productTypesRaw = await Product.aggregate([
            { $match: { product_type: { $ne: null } } },
            {
                $group: {
                    _id: { $toLower: { $trim: { input: '$product_type' } } }
                }
            },
            {
                $project: {
                    _id: 0,
                    product_type: '$_id'
                }
            }
        ]);
        const productTypes = productTypesRaw.map(item => item.product_type).sort();

        const colorsRaw = await ProductVariant.aggregate([
            { $match: { color: { $ne: null } } },
            {
                $group: {
                    _id: { $toLower: { $trim: { input: '$color' } } }
                }
            },
            {
                $project: {
                    _id: 0,
                    color: '$_id'
                }
            }
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

        const maxPriceResult = await ProductVariant.find().sort({ regular_price: -1 }).limit(1);
        const maxPrice = maxPriceResult.length > 0 ? maxPriceResult[0].regular_price : 15000;

        const filters = {
            productTypes,
            colors,
            sizes,
            maxPrice
        };

        return res.json({
            success: true,
            products: products || [],
            filters,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error fetching pet accessories.' });
    }
};

const getProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId)
            .select('id product_name product_type product_category product_description');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' }); // Changed response from send to json

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
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error fetching product details.' });
    }
};


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

        // Clean cart data - remove image_data and ensure proper structure
        const cleanCart = cart.map(item => ({
            product_id: item.product_id || null,
            variant_id: item.variant_id || null,
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
        const charge = subtotal * 0.04;
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

        // Validate card number (basic validation)
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length !== 16 || isNaN(cleanCardNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid card number'
            });
        }

        const paymentLastFour = cleanCardNumber.slice(-4);

        // Create order with transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order = await Order.create([{
                customer_id: req.user.customerId,
                order_date: new Date(),
                status: 'Pending',
                subtotal: orderTotals.subtotal,
                total_amount: orderTotals.total,
                payment_last_four: paymentLastFour
            }], { session });

            // Create order items
            const orderItems = cart.map(item => ({
                order_id: order[0]._id,
                product_id: item.product_id || null,
                variant_id: item.variant_id || null,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                size: item.size || null,
                color: item.color || null
            }));

            await OrderItem.insertMany(orderItems, { session });

            // Commit transaction
            await session.commitTransaction();
            return res.json({
                success: true,
                redirectUrl: '/my_orders'
            });
        } catch (transactionError) {
            await session.abortTransaction();
            throw transactionError;
        } finally {
            session.endSession();
        }

    } catch (err) {
        console.error('Payment processing error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error processing payment. Please try again.'
        });
    }
};

const getUserOrders = async (req, res) => {
    
    try {
        const orders = await Order.find({ customer_id: req.user.customerId})
            .sort({ order_date: -1 })
            .lean();

        const populatedOrders = await Promise.all(orders.map(async order => {
            const items = await OrderItem.find({ order_id: order._id }).lean();

            const detailedItems = await Promise.all(items.map(async item => {
                const imageDoc = await ProductImage.findOne({ product_id: item.product_id, is_primary: true });
                return {
                    ...item,
                    image_data: imageDoc?.image_data
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
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

const reorder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const items = await OrderItem.find({ order_id: orderId }).lean();
        if (items.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
        // Get product images for each item
        const cartItems = await Promise.all(items.map(async (item) => {
            const imageDoc = await ProductImage.findOne({
                product_id: item.product_id,
                is_primary: true
            });
            return {
                product_id: item.product_id ? item.product_id.toString() : null,
                variant_id: item.variant_id ? item.variant_id.toString() : null,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                size: item.size || null,
                color: item.color || null,
                image_data: imageDoc ? imageDoc.image_data : null
            };
        }));
        res.json({ success: true, cart: cartItems });
    } catch (err) {
        console.error('Reorder error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch order items' });
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