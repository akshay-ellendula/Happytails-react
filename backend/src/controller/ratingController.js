import Rating from '../models/ratingModel.js';
import { Order, OrderItem } from '../models/orderModel.js';
import mongoose from 'mongoose';

// Check if user has purchased the product
const hasUserPurchasedProduct = async (customerId, productId) => {
    const order = await Order.findOne({
        customer_id: customerId,
        status: 'Delivered'
    }).lean();

    if (!order) return false;

    const orderItem = await OrderItem.findOne({
        order_id: order._id,
        product_id: productId
    }).lean();

    return !!orderItem;
};

// Create a new rating
export const createRating = async (req, res, next) => {
    try {
        const { product_id, variant_id, order_id, rating, review, title, images } = req.body;
        const customer_id = req.user.customerId;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if user has already rated this product for this order
        const existingRating = await Rating.findOne({
            customer_id,
            product_id,
            order_id
        });

        if (existingRating) {
            return res.status(400).json({
                success: false,
                message: 'You have already rated this product for this order'
            });
        }

        // Verify user actually purchased this product
        const orderItem = await OrderItem.findOne({
            order_id,
            product_id,
            variant_id: variant_id || null
        }).populate({
            path: 'order_id',
            match: { customer_id, status: 'Delivered' }
        });

        if (!orderItem || !orderItem.order_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only rate products you have purchased and received'
            });
        }

        // Create the rating
        const newRating = await Rating.create({
            customer_id,
            product_id,
            variant_id: variant_id || null,
            order_id,
            rating,
            review: review || '',
            title: title || '',
            images: images || [],
            isVerifiedPurchase: true
        });

        // Update product's average rating (you'll need to add this to Product model)
        await updateProductAverageRating(product_id);

        res.status(201).json({
            success: true,
            message: 'Rating submitted successfully',
            rating: newRating
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already rated this product for this order'
            });
        }
        next(error);
    }
};

// Get all ratings for a product
export const getProductRatings = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, rating } = req.query;

        const query = { product_id: productId, status: 'approved' };
        
        if (rating) {
            query.rating = parseInt(rating);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [ratings, total] = await Promise.all([
            Rating.find(query)
                .populate('customer_id', 'userName profilePic')
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Rating.countDocuments(query)
        ]);

        res.json({
            success: true,
            ratings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalRatings: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get rating summary for a product
export const getProductRatingSummary = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const [summary, totalRatings] = await Promise.all([
            Rating.aggregate([
                { $match: { product_id: new mongoose.Types.ObjectId(productId), status: 'approved' } },
                {
                    $group: {
                        _id: null,
                        averageRating: { $avg: '$rating' },
                        totalRatings: { $sum: 1 },
                        ratingDistribution: {
                            $push: '$rating'
                        }
                    }
                }
            ]),
            Rating.countDocuments({ product_id: productId, status: 'approved' })
        ]);

        // Calculate distribution for each star rating
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        if (summary[0]?.ratingDistribution) {
            summary[0].ratingDistribution.forEach(rating => {
                distribution[rating]++;
            });
        }

        const result = summary[0] ? {
            averageRating: parseFloat(summary[0].averageRating.toFixed(1)),
            totalRatings: summary[0].totalRatings,
            distribution
        } : {
            averageRating: 0,
            totalRatings: 0,
            distribution
        };

        res.json({
            success: true,
            summary: result
        });
    } catch (error) {
        next(error);
    }
};

// Get user's ratings for products they purchased
export const getUserProductRatings = async (req, res, next) => {
    try {
        const customer_id = req.user.customerId;
        
        const ratings = await Rating.find({ customer_id })
            .populate('product_id', 'product_name image_data')
            .populate('variant_id', 'size color')
            .sort({ created_at: -1 })
            .lean();

        res.json({
            success: true,
            ratings
        });
    } catch (error) {
        next(error);
    }
};

// Update a rating
export const updateRating = async (req, res, next) => {
    try {
        const { ratingId } = req.params;
        const { rating, review, title } = req.body;
        const customer_id = req.user.customerId;

        const existingRating = await Rating.findOne({
            _id: ratingId,
            customer_id
        });

        if (!existingRating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found or you do not have permission to edit it'
            });
        }

        // Check if rating is too old to edit (e.g., 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (existingRating.created_at < thirtyDaysAgo) {
            return res.status(400).json({
                success: false,
                message: 'Ratings can only be edited within 30 days of submission'
            });
        }

        if (rating) existingRating.rating = rating;
        if (review !== undefined) existingRating.review = review;
        if (title !== undefined) existingRating.title = title;
        
        await existingRating.save();

        // Update product's average rating
        await updateProductAverageRating(existingRating.product_id);

        res.json({
            success: true,
            message: 'Rating updated successfully',
            rating: existingRating
        });
    } catch (error) {
        next(error);
    }
};

// Delete a rating
export const deleteRating = async (req, res, next) => {
    try {
        const { ratingId } = req.params;
        const customer_id = req.user.customerId;

        const rating = await Rating.findOneAndDelete({
            _id: ratingId,
            customer_id
        });

        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found or you do not have permission to delete it'
            });
        }

        // Update product's average rating
        await updateProductAverageRating(rating.product_id);

        res.json({
            success: true,
            message: 'Rating deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Mark a rating as helpful
export const markHelpful = async (req, res, next) => {
    try {
        const { ratingId } = req.params;
        
        const rating = await Rating.findById(ratingId);
        
        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }

        rating.helpful_count += 1;
        await rating.save();

        res.json({
            success: true,
            message: 'Marked as helpful',
            helpful_count: rating.helpful_count
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to update product's average rating
async function updateProductAverageRating(productId) {
    const result = await Rating.aggregate([
        { $match: { product_id: new mongoose.Types.ObjectId(productId), status: 'approved' } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalRatings: { $sum: 1 }
            }
        }
    ]);

    // You'll need to add rating fields to your Product model
    // For now, this function can be extended to update the Product document
    // if you add rating_average and rating_count fields to the Product schema
    
    return result[0] || { averageRating: 0, totalRatings: 0 };
}