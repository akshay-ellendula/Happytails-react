import { Product, ProductVariant, ProductImage } from '../models/productsModel.js';
import Customer from '../models/customerModel.js';
import { Order, OrderItem } from '../models/orderModel.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import uploadToCloudinary from '../utils/cloudinaryUploader.js';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;
const CHECKOUT_COOKIE_NAME = 'checkout_session';

const getCheckoutCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 10 * 60 * 1000,
});

const clearCheckoutSessionCookie = (res) => {
    res.clearCookie(CHECKOUT_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
};

const parseCheckoutSession = (req) => {
    const sessionCookie = req.cookies[CHECKOUT_COOKIE_NAME];
    if (!sessionCookie) {
        return null;
    }

    try {
        return JSON.parse(sessionCookie);
    } catch (_) {
        return null;
    }
};

const buildValidatedCart = async (cart) => {
    if (!Array.isArray(cart) || cart.length === 0) {
        throw new Error('Cart is empty or invalid');
    }

    const normalizedCart = cart.map((item, index) => {
        const quantity = Number(item?.quantity);

        if (
            !item?.product_id ||
            !mongoose.Types.ObjectId.isValid(item.product_id) ||
            !item?.variant_id ||
            !mongoose.Types.ObjectId.isValid(item.variant_id)
        ) {
            throw new Error(`Cart item ${index + 1} is invalid`);
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error(`Quantity for cart item ${index + 1} must be at least 1`);
        }

        return {
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity,
        };
    });

    const productIds = [...new Set(normalizedCart.map(item => item.product_id))];
    const variantIds = [...new Set(normalizedCart.map(item => item.variant_id))];

    const [products, variants] = await Promise.all([
        Product.find({ _id: { $in: productIds } })
            .select('_id product_name vendor_id')
            .lean(),
        ProductVariant.find({ _id: { $in: variantIds } })
            .select('_id product_id size color regular_price sale_price stock_quantity')
            .lean()
    ]);

    const productMap = new Map(products.map(product => [product._id.toString(), product]));
    const variantMap = new Map(variants.map(variant => [variant._id.toString(), variant]));

    let subtotal = 0;

    const cleanCart = normalizedCart.map((item) => {
        const product = productMap.get(item.product_id);
        const variant = variantMap.get(item.variant_id);

        if (!product || !variant || variant.product_id.toString() !== item.product_id) {
            throw new Error('One or more cart items are no longer available');
        }

        if (variant.stock_quantity < item.quantity) {
            throw new Error(`Only ${variant.stock_quantity} item(s) left for ${product.product_name}`);
        }

        const unitPrice = Number(variant.sale_price ?? variant.regular_price);
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
            throw new Error(`Pricing is unavailable for ${product.product_name}`);
        }

        subtotal += unitPrice * item.quantity;

        return {
            product_id: product._id.toString(),
            variant_id: variant._id.toString(),
            product_name: product.product_name,
            quantity: item.quantity,
            price: unitPrice,
            size: variant.size || null,
            color: variant.color || null,
        };
    });

    const roundedSubtotal = Number(subtotal.toFixed(2));
    const charge = Number((roundedSubtotal * 0.04).toFixed(2));
    const total = Number((roundedSubtotal + charge).toFixed(2));

    return {
        cleanCart,
        orderTotals: { subtotal: roundedSubtotal, charge, total }
    };
};

const getPetAccessories = async (req, res, next) => {
    try {
        console.log("Fetching pet accessories..."); 

        const [
            products,
            productTypesRaw,
            colorsRaw,
            sizesRaw,
            maxPriceResult
        ] = await Promise.all([
            Product.aggregate([
                { $lookup: { from: 'productvariants', localField: '_id', foreignField: 'product_id', as: 'variants' } },
                { $lookup: { from: 'productimages', localField: '_id', foreignField: 'product_id', as: 'images' } },
                { $addFields: { primaryImage: { $filter: { input: "$images", as: "image", cond: { $eq: [ "$$image.is_primary", true ] } } } } },
                { $unwind: { path: '$primaryImage', preserveNullAndEmptyArrays: true } },
                { $project: {
                    id: { $toString: '$_id' },
                    product_name: 1,
                    product_type: { $ifNull: [ { $toLower: { $trim: { input: '$product_type' } } }, "unknown" ] },
                    product_category: 1, 
                    variants: {
                        $map: {
                            input: '$variants', as: 'variant',
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
                } },
                { $sort: { created_at: -1 } } 
            ]),
            Product.aggregate([ 
                { $match: { product_type: { $ne: null, $ne: "" } } }, 
                { $group: { _id: { $toLower: { $trim: { input: '$product_type' } } } } },
                { $project: { _id: 0, product_type: '$_id' } }
            ]),
            ProductVariant.aggregate([ 
                { $match: { color: { $ne: null, $ne: "" } } }, 
                { $group: { _id: { $toLower: { $trim: { input: '$color' } } } } },
                { $project: { _id: 0, color: '$_id' } }
            ]),
            ProductVariant.aggregate([
                { $match: { size: { $ne: null, $ne: "" } } },
                { $group: { _id: { $toLower: { $trim: { input: '$size' } } } } },
                { $project: { _id: 0, size: '$_id' } }
            ]),
            ProductVariant.aggregate([ 
                 { $match: { regular_price: { $ne: null } } }, 
                 { $sort: { regular_price: -1 } },
                 { $limit: 1 },
                 { $project: { _id: 0, regular_price: 1 } }
            ])
        ]);

        console.log(`Found ${products.length} products after aggregation.`); 
        const productTypes = productTypesRaw.map(item => item.product_type).sort();
        const colors = colorsRaw.map(item => item.color).sort();
        const sizes = sizesRaw.map(item => item.size).sort();
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
        next(err);
    }
};

const getProduct = async (req, res, next) => {
    try {
        const productId = req.params.id;
        
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
        next(err);
    }
};

const checkout = async (req, res, next) => {
    try {
        const customerID = req.user.customerId;

        const customer = await Customer.findById(customerID);
        if (!customer) {
            return res.status(404).json({ message: "User not found" })
        }
        
        const { cart, selectedAddress } = req.body;
        const normalizedAddress = {
            name: selectedAddress?.name?.trim?.() || '',
            houseNumber: selectedAddress?.houseNumber?.trim?.() || '',
            streetNo: selectedAddress?.streetNo?.trim?.() || '',
            city: selectedAddress?.city?.trim?.() || '',
            pincode: selectedAddress?.pincode?.toString?.().trim?.() || '',
        };

        if (!normalizedAddress.city || !normalizedAddress.pincode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid shipping address.'
            });
        }

        let cleanCart;
        let orderTotals;
        try {
            ({ cleanCart, orderTotals } = await buildValidatedCart(cart));
        } catch (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError.message,
            });
        }

        const sessionData = {
            checkoutSessionId: randomUUID(),
            customerId: customerID.toString(),
            cart: cleanCart,
            orderTotals,
            selectedAddress: normalizedAddress,
            paymentIntentId: null,
        };

        res.cookie(CHECKOUT_COOKIE_NAME, JSON.stringify(sessionData), getCheckoutCookieOptions());

        return res.json({
            success: true,
            redirectUrl: '/payment'
        });

    } catch (err) {
        console.error('Checkout error:', err);
        next(err);
    }
};

const createProductPaymentIntent = async (req, res, next) => {
    try {
        if (!stripe) {
            return res.status(500).json({
                success: false,
                message: 'Stripe test mode is not configured on the server'
            });
        }

        const sessionData = parseCheckoutSession(req);
        if (!sessionData) {
            return res.status(400).json({ success: false, message: 'Session expired or invalid' });
        }

        if (sessionData.customerId !== req.user.customerId.toString()) {
            clearCheckoutSessionCookie(res);
            return res.status(403).json({ success: false, message: 'Checkout session does not belong to this user' });
        }

        const { orderTotals, checkoutSessionId } = sessionData;
        const amountInPaise = Math.round(orderTotals.total * 100);

        let paymentIntent = null;

        if (sessionData.paymentIntentId) {
            try {
                const existingPaymentIntent = await stripe.paymentIntents.retrieve(sessionData.paymentIntentId);
                const metadataMatches = existingPaymentIntent.metadata?.checkoutType === 'product'
                    && existingPaymentIntent.metadata?.customerId === req.user.customerId.toString()
                    && existingPaymentIntent.metadata?.checkoutSessionId === checkoutSessionId;
                const amountMatches = existingPaymentIntent.amount === amountInPaise
                    && existingPaymentIntent.currency === 'inr';

                if (metadataMatches && amountMatches) {
                    if (existingPaymentIntent.status === 'succeeded') {
                        return res.json({
                            success: true,
                            paymentCompleted: true,
                            paymentIntentId: existingPaymentIntent.id,
                        });
                    }

                    if (['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(existingPaymentIntent.status)) {
                        paymentIntent = existingPaymentIntent;
                    }
                }
            } catch (stripeError) {
                console.warn('Unable to reuse existing payment intent:', stripeError.message);
            }
        }

        if (!paymentIntent) {
            paymentIntent = await stripe.paymentIntents.create({
                amount: amountInPaise,
                currency: 'inr',
                payment_method_types: ['card'],
                metadata: {
                    checkoutType: 'product',
                    checkoutSessionId,
                    customerId: req.user.customerId.toString(),
                },
            });

            sessionData.paymentIntentId = paymentIntent.id;
            res.cookie(CHECKOUT_COOKIE_NAME, JSON.stringify(sessionData), getCheckoutCookieOptions());
        }

        return res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (err) {
        console.error('Create payment intent error:', err);
        next(err);
    }
};

const processPayment = async (req, res, next) => {
    try {
        if (!stripe) {
            return res.status(500).json({
                success: false,
                message: 'Stripe test mode is not configured on the server'
            });
        }

        const sessionData = parseCheckoutSession(req);
        if (!sessionData) {
            return res.status(400).json({ success: false, message: 'Session expired or invalid' });
        }

        if (sessionData.customerId !== req.user.customerId.toString()) {
            clearCheckoutSessionCookie(res);
            return res.status(403).json({ success: false, message: 'Checkout session does not belong to this user' });
        }

        const { cart, orderTotals, selectedAddress, paymentIntentId: sessionPaymentIntentId, checkoutSessionId } = sessionData;

        const { paymentIntentId } = req.body;
        if (!paymentIntentId) {
            return res.status(400).json({ success: false, message: 'Payment intent ID is required' });
        }

        if (!sessionPaymentIntentId || sessionPaymentIntentId !== paymentIntentId) {
            return res.status(400).json({ success: false, message: 'Payment intent does not match the active checkout session' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ success: false, message: 'Payment not completed' });
        }

        const expectedAmountInPaise = Math.round(orderTotals.total * 100);
        const paymentMatchesCheckout = paymentIntent.metadata?.checkoutType === 'product'
            && paymentIntent.metadata?.customerId === req.user.customerId.toString()
            && paymentIntent.metadata?.checkoutSessionId === checkoutSessionId
            && paymentIntent.amount === expectedAmountInPaise
            && paymentIntent.currency === 'inr';

        if (!paymentMatchesCheckout) {
            return res.status(400).json({ success: false, message: 'Payment verification failed for this checkout session' });
        }

        const existingOrder = await Order.findOne({ payment_intent_id: paymentIntent.id }).lean();
        if (existingOrder) {
            clearCheckoutSessionCookie(res);
            return res.json({
                success: true,
                redirectUrl: '/my_orders'
            });
        }

        let paymentLastFour = '0000';
        if (paymentIntent.payment_method) {
            try {
                const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
                paymentLastFour = pm.card?.last4 || '0000';
            } catch (_) { /* non-critical */ }
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order = await Order.create([{
                customer_id: req.user.customerId,
                order_date: new Date(),
                status: 'Pending',
                subtotal: orderTotals.subtotal,
                total_amount: orderTotals.total,
                payment_intent_id: paymentIntent.id,
                payment_last_four: paymentLastFour,
                shippingAddress: selectedAddress
            }], { session });

            const orderItems = [];

            for (const item of cart) {
                const product = await Product.findById(item.product_id).session(session);
                if (!product) {
                    throw new Error(`Product not found: ${item.product_name}`);
                }

                orderItems.push({
                    order_id: order[0]._id,
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    vendor_id: product.vendor_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size,
                    color: item.color
                });

                const updateResult = await ProductVariant.updateOne(
                    { _id: item.variant_id, stock_quantity: { $gte: item.quantity } },
                    { $inc: { stock_quantity: -item.quantity } },
                    { session }
                );

                if (updateResult.matchedCount === 0 || updateResult.modifiedCount === 0) {
                    throw new Error(`Insufficient stock for ${item.product_name}`);
                }
            }

            await OrderItem.insertMany(orderItems, { session });
            await session.commitTransaction();
            clearCheckoutSessionCookie(res);

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

    } catch (err) {
        console.error('Payment processing error:', err);
        next(err);
    }
};

const getUserOrders = async (req, res, next) => {
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
                let imageData = null;
                if (item.product_id) {
                    const imageDoc = await ProductImage.findOne({
                        product_id: item.product_id,
                        is_primary: true
                    }).select('image_data').lean(); 
                    imageData = imageDoc?.image_data || null;
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
        next(error);
    }
};

const reorder = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;

        const order = await Order.findOne({ _id: orderId, customer_id: req.user.customerId }).lean(); 
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or access denied' });
        }

        const items = await OrderItem.find({ order_id: orderId }).lean();
        if (items.length === 0) return res.status(404).json({ success: false, message: 'Order items not found' });
        
        const cartItems = await Promise.all(items.map(async (item) => {
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
                image_data: imageData
            };
        }));
        res.json({ success: true, cart: cartItems });
    } catch (err) {
        console.error('Reorder error:', err);
        next(err);
    }
};

// Add to productController.js
const getProductWithRatings = async (req, res, next) => {
    try {
        const productId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID format' });
        }

        const product = await Product.findById(productId)
            .select('id product_name product_type product_category product_description rating_average rating_count');
        
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
            rating_average: product.rating_average || 0,
            rating_count: product.rating_count || 0,
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
        next(err);
    }
};

export {
    getPetAccessories,
    getProduct,
    checkout,
    getProductWithRatings,
    createProductPaymentIntent,
    processPayment,
    getUserOrders,
    reorder,
};
