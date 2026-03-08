// productsModel.js

import mongoose from 'mongoose'; // Change require to import

// --- Schemas related to Product Catalog ---

const productSchema = new mongoose.Schema({
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    product_name: { type: String, required: true },
    product_category: { type: String, required: true },
    product_type: { type: String, required: true },
    product_description: { type: String, required: true },
    sku: { type: String, default: null },
    stock_status: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false }
});

const productVariantSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    size: { type: String, default: null },
    color: { type: String, default: null },
    regular_price: { type: Number, required: true },
    sale_price: { type: Number, default: null },
    stock_quantity: { type: Number, required: true },
    sku: { type: String, default: null },
});

const productImageSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    image_data: { type: String, required: true },
    is_primary: { type: Boolean, default: false },
});

// --- Create Models ---
const Product = mongoose.model('Product', productSchema);
const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
const ProductImage = mongoose.model('ProductImage', productImageSchema);


// Change module.exports to ES named export
export {
    Product,
    ProductVariant,
    ProductImage,
};