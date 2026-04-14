import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { axiosInstance } from '../utils/axios';
import RatingStars from './RatingStars';

const RatingModal = ({ isOpen, onClose, product, orderId, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const response = await axiosInstance.post('/ratings/create', {
                product_id: product.id,
                variant_id: product.variant_id,
                order_id: orderId,
                rating,
                title,
                review
            });
            
            if (response.data.success) {
                onSuccess && onSuccess(response.data.rating);
                onClose();
                // Reset form
                setRating(0);
                setTitle('');
                setReview('');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-2xl font-bold mb-4">Rate Your Product</h2>
                
                <div className="mb-4">
                    <img
                        src={product.image_data || '/images/default-product.jpg'}
                        alt={product.product_name}
                        className="w-20 h-20 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-center font-semibold mt-2">{product.product_name}</p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Rating *
                        </label>
                        <RatingStars rating={rating} onRatingChange={setRating} />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Review Title (Optional)
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2c737]"
                            placeholder="Summarize your experience"
                            maxLength={100}
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Your Review (Optional)
                        </label>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f2c737]"
                            rows="4"
                            placeholder="Share your experience with this product"
                            maxLength={1000}
                        />
                    </div>
                    
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading || rating === 0}
                        className="w-full py-3 bg-[#1a1a1a] text-[#f2c737] font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Rating'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RatingModal;