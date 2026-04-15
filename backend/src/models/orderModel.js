import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    order_date: { type: Date, default: Date.now, index: true },
    status: { type: String, required: true, default: 'Pending' },
    subtotal: { type: Number, required: true },
    total_amount: { type: Number, required: true },
    delivery_date: { type: Date, default: null },
    shipped_at: { type: Date, default: null },
    delivered_at: { type: Date, default: null },
    cancelled_at: { type: Date, default: null },
    payment_intent_id: { type: String, default: null, index: true },
    payment_last_four: { type: String, default: null },
    is_deleted: { type: Boolean, default: false },
    shippingAddress: {
        name: { type: String, default: "" },
        houseNumber: { type: String },
        streetNo: { type: String },
        city: { type: String },
        pincode: { type: String }
    },
    timeline: [{
        status: { type: String },
        date: { type: Date },
        description: { type: String }
    }],
    vendor_notes: [{
        text: { type: String, required: true },
        created_at: { type: Date, default: Date.now },
    }],
});

const orderItemSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null, index: true },
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    product_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: { type: String, default: null },
    color: { type: String, default: null },
    is_deleted: { type: Boolean, default: false },
});

const Order = mongoose.model('Order', orderSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);

export {
    Order,
    OrderItem,
};
