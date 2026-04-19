import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../utils/axios';
import toast from 'react-hot-toast';

const ReviewPage = () => {
    const { ticketId, token } = useParams();
    const navigate = useNavigate();
    
    // State for fetching initial data
    const [isLoading, setIsLoading] = useState(true);
    const [eventDetails, setEventDetails] = useState(null);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // State for the form
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Fetch Event & Review Status on Load
    useEffect(() => {
        const fetchReviewData = async () => {
            try {
                const response = await axiosInstance.get(`/review/${ticketId}/${token}`);
                setEventDetails(response.data.event);
                setAlreadyReviewed(response.data.isReviewed);
            } catch (error) {
                setErrorMsg(error.response?.data?.message || "Invalid or expired link.");
                toast.error(error.response?.data?.message || "Failed to load event.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviewData();
    }, [ticketId, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) return toast.error("Please select a rating (1-5 stars).");
        if (!comment.trim()) return toast.error("Please share a few words.");

        try {
            setIsSubmitting(true);
            const response = await axiosInstance.post(`/review/${ticketId}/${token}`, { rating, comment });
            toast.success(response.data.message || "Review submitted successfully!");
            setIsSuccess(true);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit review.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-[#f2c737]"></div>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 text-center">
                    <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2">Oops! 🐕</h2>
                    <p className="text-[#1a1a1a] font-medium mb-8">{errorMsg}</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="w-full bg-[#1a1a1a] text-white px-6 py-3 border-2 border-black rounded-xl font-bold hover:bg-[#f2c737] hover:text-black transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center py-12 p-4">
            {/* Event Details Card */}
            {eventDetails && (
                <div className="max-w-lg w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden mb-10 transition-transform hover:-translate-y-1">
                    {eventDetails.images?.thumbnail && (
                        <div className="border-b-2 border-black relative">
                            <img 
                                src={eventDetails.images.thumbnail} 
                                alt={eventDetails.title} 
                                className="w-full h-48 object-cover"
                            />
                        </div>
                    )}
                    <div className="p-6 text-center">
                        <span className="inline-block bg-[#f2c737] text-[#1a1a1a] px-3 py-1 rounded-full text-xs font-bold border-2 border-black uppercase tracking-wider mb-3">
                            You Attended
                        </span>
                        <h2 className="text-2xl font-bold text-[#1a1a1a]">{eventDetails.title}</h2>
                        <p className="text-[#1a1a1a]/70 font-semibold mt-2">
                            {new Date(eventDetails.date_time).toLocaleDateString('en-US', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            )}
            <div className="max-w-lg w-full bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8">
                {/* ALREADY REVIEWED OR SUCCESS STATE */}
                {alreadyReviewed || isSuccess ? (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-[#f2c737] border-2 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-[#1a1a1a] mb-3">
                            {alreadyReviewed ? "Already Reviewed!" : "Thank You!"}
                        </h2>
                        <p className="text-[#1a1a1a] font-medium mb-8">
                            {alreadyReviewed 
                                ? "You have already submitted a review for this event. We appreciate your feedback!" 
                                : "Your review has been successfully submitted."}
                        </p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="w-full bg-[#f2c737] text-black px-6 py-3 border-2 border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform active:translate-y-0 active:shadow-none"
                        >
                            Back to Home
                        </button>
                    </div>
                ) : (
                    /* REVIEW FORM STATE */
                    (<>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-[#1a1a1a]">How was it? 🐾</h1>
                            <p className="text-[#1a1a1a] font-medium mt-2">Rate your experience to help others!</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex flex-col items-center bg-[#effe8b] border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <div className="flex space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            className={`text-5xl focus:outline-none transition-transform hover:scale-110 ${
                                                star <= (hover || rating) ? 'text-[#f2c737] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                                            }`}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(rating)}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wide">Tell us more</label>
                                <textarea
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-black bg-white text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow resize-none"
                                    placeholder="What did you and your pet enjoy the most?"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 px-4 font-bold text-lg rounded-xl border-2 border-black transition-all ${
                                    isSubmitting 
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                        : 'bg-[#f2c737] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none'
                                }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </>)
                )}
            </div>
        </div>
    );
};

export default ReviewPage;