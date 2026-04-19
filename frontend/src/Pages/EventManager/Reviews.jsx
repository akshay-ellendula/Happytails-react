import React, { useState, useEffect, useMemo } from 'react';
import { axiosInstance } from '../../utils/axios';

const Reviews = () => {
    const [reviewsData, setReviewsData] = useState({ stats: { totalReviews: 0, averageRating: 0 }, reviews: [] });
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState('all');
    const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' or 'analysis'
    
    // Advanced Filters & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'reviewed', 'pending', 'not_sent'
    const [currentReviewPage, setCurrentReviewPage] = useState(1);
    const [currentTrackingPage, setCurrentTrackingPage] = useState(1);
    const itemsPerPage = 8;
    
    // Modal State
    const [selectedReviewDetail, setSelectedReviewDetail] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reviewsRes, analyticsRes] = await Promise.all([
                    axiosInstance.get('/review/manager'),
                    axiosInstance.get('/review/manager/analytics')
                ]);
                setReviewsData(reviewsRes.data);
                setAnalyticsData(analyticsRes.data.deepAnalysis || []);
            } catch (err) {
                console.error("Failed to fetch reviews data:", err);
                setError("Could not load reviews at this time.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 1. Extract unique events for the filter dropdown
    const uniqueEvents = useMemo(() => {
        const eventsMap = new Map();
        reviewsData.reviews.forEach(review => {
            if (review.eventId) {
                eventsMap.set(review.eventId._id, review.eventId.title);
            }
        });
        analyticsData.forEach(analysis => {
            if (analysis.eventId) {
                eventsMap.set(analysis.eventId, analysis.eventTitle);
            }
        });
        return Array.from(eventsMap, ([id, title]) => ({ id, title }));
    }, [reviewsData.reviews, analyticsData]);

    // 2. Filter reviews based on selected dropdown
    const filteredReviews = useMemo(() => {
        let sorted = [...reviewsData.reviews];
        if (selectedEvent !== 'all') {
            sorted = sorted.filter(r => r.eventId?._id === selectedEvent);
        }
        return sorted;
    }, [reviewsData.reviews, selectedEvent]);

    const filteredAnalytics = useMemo(() => {
        let result = analyticsData;
        
        // Event Filter
        if (selectedEvent !== 'all') {
            result = result.filter(a => a.eventId === selectedEvent);
        }
        
        // Status Filter
        if (statusFilter === 'reviewed') {
            result = result.filter(a => a.isReviewed);
        } else if (statusFilter === 'pending') {
            result = result.filter(a => !a.isReviewed && a.isEmailSent);
        } else if (statusFilter === 'not_sent') {
            result = result.filter(a => !a.isEmailSent);
        }

        // Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(a => 
                (a.customerName && a.customerName.toLowerCase().includes(query)) ||
                (a.customerEmail && a.customerEmail.toLowerCase().includes(query)) ||
                (a.ticketId && a.ticketId.toLowerCase().includes(query))
            );
        }

        return result;
    }, [analyticsData, selectedEvent, statusFilter, searchQuery]);

    // Pagination Logic
    const paginateReviews = useMemo(() => {
        const indexOfLast = currentReviewPage * itemsPerPage;
        const indexOfFirst = indexOfLast - itemsPerPage;
        return filteredReviews.slice(indexOfFirst, indexOfLast);
    }, [filteredReviews, currentReviewPage]);

    const totalReviewPages = Math.ceil(filteredReviews.length / itemsPerPage);

    const paginateTracking = useMemo(() => {
        const indexOfLast = currentTrackingPage * itemsPerPage;
        const indexOfFirst = indexOfLast - itemsPerPage;
        return filteredAnalytics.slice(indexOfFirst, indexOfLast);
    }, [filteredAnalytics, currentTrackingPage]);

    const totalTrackingPages = Math.ceil(filteredAnalytics.length / itemsPerPage);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentReviewPage(1);
        setCurrentTrackingPage(1);
    }, [selectedEvent, statusFilter, searchQuery, activeTab]);

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
            {/* Tabs for toggling views */}
            <div className="flex gap-4 border-b-2 border-black pb-4 mt-8">
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`font-black text-lg px-6 py-2 uppercase border-2 border-black rounded-xl transition-all ${
                        activeTab === 'reviews' 
                            ? 'bg-[#effe8b] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                            : 'bg-white hover:bg-gray-100'
                    }`}
                >
                    Customer Feedback
                </button>
                <button 
                    onClick={() => setActiveTab('analysis')}
                    className={`font-black text-lg px-6 py-2 uppercase border-2 border-black rounded-xl transition-all ${
                        activeTab === 'analysis' 
                            ? 'bg-[#f2c737] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                            : 'bg-white hover:bg-gray-100'
                    }`}
                >
                    Attendee Tracking
                </button>
            </div>
            {/* Conditional Views based on Tabs */}
            {activeTab === 'reviews' ? (
                /* Reviews List Grid */
                (<div className="mt-4">
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
                            {paginateReviews.map((review) => (
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
                    {/* Reviews Pagination Controls */}
                    {totalReviewPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button 
                                disabled={currentReviewPage === 1}
                                onClick={() => setCurrentReviewPage(prev => prev - 1)}
                                className="bg-white border-2 border-black px-4 py-2 font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <span className="font-bold">
                                Page {currentReviewPage} of {totalReviewPages}
                            </span>
                            <button 
                                disabled={currentReviewPage === totalReviewPages}
                                onClick={() => setCurrentReviewPage(prev => prev + 1)}
                                className="bg-[#f2c737] border-2 border-black px-4 py-2 font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>)
            ) : (
                /* Attendee Deep Analysis Section */
                (<div className="mt-4 space-y-6">
                    {/* Advanced Filters Bar */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <input 
                            type="text" 
                            placeholder="🔍 Search name, email, or ticket ID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-white border-2 border-black px-4 py-3 font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                        />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border-2 border-black px-4 py-3 font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="reviewed">🌟 Reviewed</option>
                            <option value="pending">⏳ Email Sent (Pending)</option>
                            <option value="not_sent">🚫 Email Not Sent</option>
                        </select>
                    </div>
                    {filteredAnalytics.length === 0 ? (
                        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-12 text-center mt-6">
                            <p className="text-2xl font-bold text-[#1a1a1a]">No attendees found!</p>
                            <p className="text-gray-600 mt-2 font-medium">Wait for customers to book tickets to start tracking.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white h-auto max-h-[600px]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#f2c737] sticky top-0 z-10">
                                    <tr className="border-b-2 border-black text-black">
                                        <th className="p-4 font-black uppercase text-sm border-r-2 border-black">Attendee</th>
                                        <th className="p-4 font-black uppercase text-sm border-r-2 border-black">Ticket ID</th>
                                        <th className="p-4 font-black uppercase text-sm border-r-2 border-black">Event</th>
                                        <th className="p-4 font-black uppercase text-sm border-r-2 border-black text-center">Review Email Sent?</th>
                                        <th className="p-4 font-black uppercase text-sm text-center">Review Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginateTracking.map((analysis, i) => (
                                        <tr key={i} className={`border-b-2 border-black ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-amber-50`}>
                                            <td className="p-4 border-r-2 border-black">
                                                <div>
                                                    <p className="font-bold text-gray-900">{analysis.customerName}</p>
                                                    <p className="text-sm text-gray-600">{analysis.customerEmail}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-gray-700 border-r-2 border-black text-sm">{analysis.ticketId}</td>
                                            <td className="p-4 font-bold text-[#1a1a1a] border-r-2 border-black text-sm">{analysis.eventTitle}</td>
                                            <td className="p-4 text-center border-r-2 border-black">
                                                {analysis.isEmailSent ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="inline-block bg-blue-100 text-blue-800 border-2 border-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase truncate max-w-full">
                                                            Sent
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-bold">
                                                            {new Date(analysis.emailSentAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-block bg-gray-200 text-gray-600 border-2 border-gray-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                                        Not Sent
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {analysis.isReviewed ? (
                                                    <button 
                                                        onClick={() => setSelectedReviewDetail(analysis)}
                                                        className="inline-block bg-green-200 hover:bg-green-300 text-green-900 border-2 border-green-900 text-xs font-black px-3 py-1 rounded-full uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(20,83,45,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(20,83,45,1)] active:shadow-none active:translate-y-[2px] transition-all"
                                                        title="Click to view full review and ticket details"
                                                    >
                                                        Reviewed 🌟
                                                    </button>
                                                ) : (
                                                    <span className="inline-block bg-yellow-200 text-yellow-800 border-2 border-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                                        Pending ⏳
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* Tracking Pagination Controls */}
                    {totalTrackingPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button 
                                disabled={currentTrackingPage === 1}
                                onClick={() => setCurrentTrackingPage(prev => prev - 1)}
                                className="bg-white border-2 border-black px-4 py-2 font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <span className="font-bold">
                                Page {currentTrackingPage} of {totalTrackingPages}
                            </span>
                            <button 
                                disabled={currentTrackingPage === totalTrackingPages}
                                onClick={() => setCurrentTrackingPage(prev => prev + 1)}
                                className="bg-[#f2c737] border-2 border-black px-4 py-2 font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>)
            )}
            {/* Detailed Review Modal */}
            {selectedReviewDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
                    <div className="bg-white border-4 border-black rounded-2xl w-full max-w-5xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative animate-in fade-in zoom-in duration-300 my-auto mt-10 mb-10 max-h-[90vh] flex flex-col overflow-hidden">
                        
                        {/* Header */}
                        <div className="bg-[#f2c737] border-b-4 border-black p-6 md:p-8 flex justify-between items-start shrink-0">
                            <div>
                                <h2 className="text-4xl font-black text-[#1a1a1a] uppercase tracking-wide">Tracker Profile</h2>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    <span className="bg-white px-3 py-1 text-sm font-bold border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                                        🎟️ Ticket: {selectedReviewDetail.ticketId}
                                    </span>
                                    <span className="bg-[#effe8b] px-3 py-1 text-sm font-bold border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                                        📅 Purchased: {new Date(selectedReviewDetail.purchaseDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedReviewDetail(null)}
                                className="w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-full transition-all text-xl font-black"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Scrollable Content Body */}
                        <div className="p-6 md:p-8 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                
                                {/* Left Column: Purchaser & Ticket Details */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-white border-4 border-black p-5 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-400 border-r-4 border-black"></div>
                                        <div className="ml-4">
                                            <h3 className="font-black text-gray-500 uppercase tracking-widest text-xs mb-2">Purchaser Detail</h3>
                                            <p className="font-black text-2xl text-black uppercase mb-1">{selectedReviewDetail.customerName}</p>
                                            <p className="font-bold text-gray-700 text-sm">📞 {selectedReviewDetail.ticketDetails?.contactPhone || 'N/A'}</p>
                                            <p className="font-bold text-gray-700 text-sm">✉️ {selectedReviewDetail.ticketDetails?.contactEmail || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#effe8b] border-4 border-black p-5 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs mb-3">Ticket Summary</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-white p-2 border-2 border-black rounded-lg">
                                                <span className="font-bold text-sm">Number of Tickets</span>
                                                <span className="font-black text-xl">{selectedReviewDetail.numberOfTickets || "1"}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 border-2 border-black rounded-lg">
                                                <span className="font-bold text-sm">Total Paid</span>
                                                <span className="font-black text-xl text-green-700">${selectedReviewDetail.ticketDetails?.price || "0"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedReviewDetail.ticketDetails?.petName && (
                                        <div className="bg-purple-100 border-4 border-black p-5 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <h3 className="font-black text-purple-900 uppercase tracking-widest text-xs mb-2">🐾 Pet bringing</h3>
                                            <p className="font-black text-xl text-black">{selectedReviewDetail.ticketDetails.petName}</p>
                                            <p className="font-bold text-gray-700 text-sm mt-1">{selectedReviewDetail.ticketDetails.petBreed} • {selectedReviewDetail.ticketDetails.petAge} yrs</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Columns: Event Info & Review */}
                                <div className="lg:col-span-2 space-y-6">
                                    
                                    {/* Event Info Box */}
                                    <div className="bg-white border-4 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row">
                                        <div className="bg-gray-100 border-b-4 md:border-b-0 md:border-r-4 border-black p-6 md:w-1/3 flex flex-col justify-center">
                                            <span className="inline-block bg-black text-white text-xs font-black uppercase px-2 py-1 rounded w-max mb-3">Event Attended</span>
                                            <h3 className="font-black text-2xl leading-tight mb-2">{selectedReviewDetail.eventDetails?.title || selectedReviewDetail.eventTitle}</h3>
                                            <p className="font-bold text-sm text-gray-600 bg-gray-200 inline-block px-2 py-1 rounded-md border-2 border-gray-300 w-max mt-2">
                                                {selectedReviewDetail.eventDetails?.category || 'General'}
                                            </p>
                                        </div>
                                        <div className="p-6 md:w-2/3 bg-white grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Date</p>
                                                <p className="font-bold text-gray-800">{selectedReviewDetail.eventDetails?.date_time ? new Date(selectedReviewDetail.eventDetails.date_time).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Time</p>
                                                <p className="font-bold text-gray-800">{selectedReviewDetail.eventDetails?.date_time ? new Date(selectedReviewDetail.eventDetails.date_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</p>
                                            </div>
                                            <div className="col-span-2 mt-2">
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">Location</p>
                                                <p className="font-bold text-gray-800">{selectedReviewDetail.eventDetails?.venue || 'Venue N/A'} • {selectedReviewDetail.eventDetails?.location || 'Location N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Box */}
                                    {selectedReviewDetail.reviewData ? (
                                        <div className="bg-[#1a1a1a] text-white border-4 border-black p-6 md:p-8 rounded-xl shadow-[6px_6px_0px_0px_rgba(242,199,55,1)] relative mt-8">
                                            {/* Golden Quote mark */}
                                            <div className="absolute -top-6 -left-2 text-7xl text-[#f2c737] font-serif drop-shadow-md">"</div>
                                            
                                            <div className="flex justify-between items-center border-b-2 border-gray-700 pb-4 mb-4 relative z-10 md:pl-6">
                                                <h3 className="font-black text-gray-300 uppercase tracking-widest text-sm">Customer Review</h3>
                                                <span className="text-[#f2c737] text-3xl font-black tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                                    {"★".repeat(selectedReviewDetail.reviewData.rating)}
                                                </span>
                                            </div>
                                            <p className="font-medium text-xl leading-relaxed italic pr-4">
                                                {selectedReviewDetail.reviewData.comment}
                                            </p>
                                            <div className="flex justify-end mt-6">
                                                <p className="text-xs font-bold text-gray-400 bg-gray-800 px-3 py-1 rounded-full border-2 border-gray-900 shadow-inner">
                                                    Submitted on: {new Date(selectedReviewDetail.reviewData.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-100 border-4 border-dashed border-gray-400 p-8 rounded-xl text-center mt-8">
                                            <div className="inline-flex w-16 h-16 items-center justify-center bg-white border-4 border-gray-300 rounded-full mb-4 shadow-sm">
                                                <span className="text-2xl">⏳</span>
                                            </div>
                                            <p className="font-black text-xl text-gray-500 uppercase">Review Pending</p>
                                            <p className="font-bold text-gray-500 mt-2">This attendee has not submitted their review yet.</p>
                                        </div>
                                    )}
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;