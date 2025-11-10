// orderModel.js

import mongoose from 'mongoose'; // <-- CHANGE 1: Use ES import

// --- Schemas related to Orders and Transactions ---

const orderSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    order_date: { type: Date, default: Date.now },
    status: { type: String, required: true, default: 'Pending' },
    subtotal: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    delivery_date: { type: Date, default: null },
    shipped_at: { type: Date, default: null },
    delivered_at: { type: Date, default: null },
    cancelled_at: { type: Date, default: null },
    payment_last_four: { type: String, default: null },
    is_deleted: { type: Boolean, default: false },
    timeline: [{
        status: { type: String },
        date: { type: Date },
        description: { type: String }
    }],
});

const orderItemSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    product_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: { type: String, default: null },
    color: { type: String, default: null },
    is_deleted: { type: Boolean, default: false },
});

// --- Create Models ---
const Order = mongoose.model('Order', orderSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);


// --- CHANGE 2: Use ES Module named export ---
export {
    Order,
    OrderItem,
};