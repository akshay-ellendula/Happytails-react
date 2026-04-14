import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };
    
    const starSize = sizes[size] || sizes.md;
    
    const handleClick = (value) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };
    
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleClick(star)}
                    className={readonly ? 'cursor-default' : 'cursor-pointer'}
                    disabled={readonly}
                >
                    <Star
                        className={`${starSize} ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
};

export default RatingStars;