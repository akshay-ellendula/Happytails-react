import React, { useState, useEffect, useMemo } from 'react';
import { axiosInstance } from '../../utils/axios';

const Reviews = () => {
    const [reviewsData, setReviewsData] = useState({ stats: { totalReviews: 0, averageRating: 0 }, reviews: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState('all');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axiosInstance.get('/review/manager');
                setReviewsData(response.data);
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
                setError("Could not load reviews at this time.");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // 1. Extract unique events for the filter dropdown
    const uniqueEvents = useMemo(() => {
        const eventsMap = new Map();
        reviewsData.reviews.forEach(review => {
            if (review.eventId) {
                eventsMap.set(review.eventId._id, review.eventId.title);
            }
        });
        return Array.from(eventsMap, ([id, title]) => ({ id, title }));
    }, [reviewsData.reviews]);

    // 2. Filter reviews based on selected dropdown
    const filteredReviews = useMemo(() => {
        if (selectedEvent === 'all') return reviewsData.reviews;
        return reviewsData.reviews.filter(r => r.eventId?._id === selectedEvent);
    }, [reviewsData.reviews, selectedEvent]);

    // 3. Calculate dynamic stats and rating distribution graph data
    const currentStats = useMemo(() => {
        const total = filteredReviews.length;
        const avg = total > 0 
            ? (filteredReviews.reduce((sum, rev) => sum + rev.rating, 0) / total).toFixed(1) 
            : 0;
        
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        filteredReviews.forEach(r => {
            if (distribution[r.rating] !== undefined) distribution[r.rating]++;
        });

        return { total, avg, distribution };
    }, [filteredReviews]);

    const renderStars = (rating) => {
        return (
            <div className="flex text-[#f2c737] text-2xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {'★'.repeat(rating)}
                <span className="text-gray-300 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {'★'.repeat(5 - rating)}
                </span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-[#f2c737]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 md:p-8">
                <div className="bg-red-100 border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-red-700 font-bold text-lg">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
            
            {/* Header & Filter Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-4xl font-black text-[#1a1a1a] uppercase tracking-wide">
                    Reviews & Feedback 🐾
                </h1>
                
                {/* Custom Styled Select Dropdown */}
                <div className="relative">
                    <select 
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="appearance-none w-full md:w-72 bg-white border-2 border-black text-[#1a1a1a] font-bold py-3 px-4 pr-10 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] transition-all cursor-pointer"
                    >
                        <option value="all">All Events (Overall)</option>
                        {uniqueEvents.map(event => (
                            <option key={event.id} value={event.id}>
                                {event.title}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black font-bold">
                        ▼
                    </div>
                </div>
            </div>

            {/* Dashboard Stats & Graph Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left: Big Average Stat */}
                <div className="lg:col-span-1 bg-[#f2c737] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <p className="text-black font-black uppercase tracking-widest mb-2 text-sm border-2 border-black px-3 py-1 rounded-full bg-white">
                        {selectedEvent === 'all' ? 'Overall Rating' : 'Event Rating'}
                    </p>
                    <h2 className="text-7xl font-black text-black mt-4 mb-2">{currentStats.avg}</h2>
                    <div className="mb-4">{renderStars(Math.round(currentStats.avg))}</div>
                    <p className="text-black font-bold text-lg">
                        Based on {currentStats.total} {currentStats.total === 1 ? 'review' : 'reviews'}
                    </p>
                </div>

                {/* Right: Rating Distribution Graph */}
                <div className="lg:col-span-2 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-8">
                    <h3 className="font-bold text-xl text-[#1a1a1a] uppercase mb-6 border-b-2 border-black pb-2">Rating Breakdown</h3>
                    
                    <div className="space-y-4">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = currentStats.distribution[star];
                            const percentage = currentStats.total > 0 ? (count / currentStats.total) * 100 : 0;
                            
                            return (
                                <div key={star} className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 w-16">
                                        <span className="font-bold text-lg">{star}</span>
                                        <span className="text-[#f2c737] drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">★</span>
                                    </div>
                                    
                                    {/* Progress Bar Track */}
                                    <div className="flex-1 h-6 bg-gray-100 border-2 border-black rounded-full overflow-hidden">
                                        {/* Progress Fill */}
                                        <div 
                                            className="h-full bg-[#effe8b] border-r-2 border-black transition-all duration-500 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="w-12 text-right font-bold text-gray-700">
                                        {count}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Reviews List Grid */}
            <div className="mt-8">
                <h3 className="font-black text-2xl text-[#1a1a1a] uppercase mb-6 flex items-center gap-2">
                    Customer Feedback <span className="bg-[#effe8b] text-sm px-3 py-1 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{currentStats.total}</span>
                </h3>

                {filteredReviews.length === 0 ? (
                    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-12 text-center mt-6">
                        <div className="w-20 h-20 bg-[#effe8b] border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <span className="text-3xl">📝</span>
                        </div>
                        <p className="text-2xl font-bold text-[#1a1a1a]">No reviews found!</p>
                        <p className="text-gray-600 mt-2 font-medium">Wait for customers to leave their feedback for this selection.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredReviews.map((review) => (
                            <div key={review._id} className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 flex flex-col h-full transition-transform hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-4">
                                    <div>
                                        <h3 className="font-black text-xl text-[#1a1a1a] uppercase line-clamp-1" title={review.eventId?.title}>
                                            {review.eventId?.title || "Unknown Event"}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-8 h-8 rounded-full border-2 border-black overflow-hidden bg-[#effe8b]">
                                                {review.customerId?.profilePic ? (
                                                    <img src={review.customerId.profilePic} alt="User" className="w-full h-full object-cover"/>
                                                ) : (
                                                    <span className="w-full h-full flex items-center justify-center font-bold text-xs">
                                                        {review.customerId?.userName?.charAt(0).toUpperCase() || "U"}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-bold text-[#1a1a1a]">
                                                {review.customerId?.userName || "Anonymous"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {renderStars(review.rating)}
                                        <p className="text-xs font-bold text-black uppercase bg-[#effe8b] px-2 py-1 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-1 bg-gray-50 border-2 border-black rounded-xl p-4 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)]">
                                    <p className="text-[#1a1a1a] font-medium text-lg italic leading-relaxed">
                                        "{review.comment}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;