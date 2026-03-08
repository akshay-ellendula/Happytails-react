import { Product, ProductVariant, ProductImage } from '../models/productsModel.js';
import Customer from '../models/customerModel.js';
import { Order, OrderItem } from '../models/orderModel.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import uploadToCloudinary from '../utils/cloudinaryUploader.js';

const getPetAccessories = async (req, res, next) => {
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
            { $match: { size: { $ne: null, $ne: "" } } },
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

        if (!selectedAddress || !selectedAddress.city || !selectedAddress.pincode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid shipping address.'
            });
        }

        // Basic cart validation (adjust according to your needs)
        if (!Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty or invalid' });
        }

        let subtotal = 0;
        const cleanCart = cart.map(item => {
            subtotal += item.price * item.quantity;
            return {
                product_id: item.product_id,
                variant_id: item.variant_id,
                product_name: item.product_name,
                quantity: Number(item.quantity),
                price: Number(item.price),
                size: item.size || null,
                color: item.color || null
            };
        });

        const charge = subtotal * 0.04;
        const total = subtotal + charge;

        const orderTotals = { subtotal, charge, total };

        const sessionData = {
            cart: cleanCart,
            orderTotals,
            selectedAddress,
        };

        res.cookie('checkout_session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 10 * 60 * 1000 // 10 minutes
        });

        return res.json({
            success: true,
            redirectUrl: '/payment'
        });

    } catch (err) {
        console.error('Checkout error:', err);
        next(err);
    }
};

const processPayment = async (req, res, next) => {
    try {
        const sessionCookie = req.cookies.checkout_session;
        if (!sessionCookie) {
            return res.status(400).json({ success: false, message: 'Session expired or invalid' });
        }

        const sessionData = JSON.parse(sessionCookie);
        const { cart, orderTotals, selectedAddress } = sessionData;

        const { cardNumber, expiryDate, cvv } = req.body;

        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length !== 16 || isNaN(cleanCardNumber)) {
            return res.status(400).json({ success: false, message: 'Invalid card number' });
        }
        const paymentLastFour = cleanCardNumber.slice(-4);

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order = await Order.create([{
                customer_id: req.user.customerId,
                order_date: new Date(),
                status: 'Pending',
                subtotal: orderTotals.subtotal,
                total_amount: orderTotals.total,
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

            res.clearCookie('checkout_session');

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

export {
    getPetAccessories,
    getProduct,
    checkout,
    processPayment,
    getUserOrders,
    reorder,
};