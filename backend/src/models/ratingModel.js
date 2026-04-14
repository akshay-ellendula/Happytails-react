import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant',
        default: null
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    title: {
        type: String,
        trim: true,
        maxlength: 100
    },
    images: [{
        type: String  // Store image URLs from Cloudinary
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpful_count: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Compound index to ensure a customer can only rate a product once per order
ratingSchema.index({ customer_id: 1, product_id: 1, order_id: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);
export default Rating;