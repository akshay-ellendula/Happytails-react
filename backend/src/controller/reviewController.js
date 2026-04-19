import crypto from 'crypto';
import Ticket from '../models/ticketModel.js';
import Review from '../models/reviewModel.js';
import Event from '../models/eventModel.js';

// GET /api/review/:ticketId/:token
export const getReviewDetails = async (req, res, next) => {
    try {
        const { ticketId, token } = req.params;
        const currentUserId = req.user.customerId;

        // Find ticket and populate the event details
        const ticket = await Ticket.findById(ticketId).populate('eventId');

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Ensure it's the correct user logged in
        if (ticket.customerId.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: "You are not authorized to view this." });
        }

        // If already reviewed, return event data but flag it
        if (ticket.isReviewed) {
            return res.status(200).json({ isReviewed: true, event: ticket.eventId });
        }

        // Verify token for unreviewed tickets
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        if (ticket.reviewToken !== hashedToken || ticket.reviewTokenExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired review link." });
        }

        // Send back event details ready for review
        return res.status(200).json({ isReviewed: false, event: ticket.eventId });

    } catch (error) {
        console.error("Error fetching review details:", error);
        next(error);
    }
};

// POST /api/review/:ticketId/:token
export const submitReview = async (req, res, next) => {
    try {
        const { ticketId, token } = req.params;
        const { rating, comment } = req.body;
        const currentUserId = req.user.customerId;

        // Hash the token from the URL to compare with DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find ticket and validate ALL security constraints
        const ticket = await Ticket.findOne({
            _id: ticketId,
            reviewToken: hashedToken,
            reviewTokenExpires: { $gt: Date.now() } 
        });

        if (!ticket) {
            return res.status(400).json({ message: "Invalid or expired review link." });
        }

        // Ensure the logged-in user is the actual ticket buyer
        if (ticket.customerId.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: "You are not authorized to review this ticket." });
        }

        // Prevent multiple submissions
        if (ticket.isReviewed) {
            return res.status(400).json({ message: "You have already submitted a review for this event." });
        }

        // Save the Review
        await Review.create({
            eventId: ticket.eventId,
            customerId: currentUserId,
            ticketId: ticket._id,
            rating,
            comment
        });

        // Void the token and mark as reviewed
        ticket.isReviewed = true;
        ticket.reviewToken = undefined;
        ticket.reviewTokenExpires = undefined;
        await ticket.save();

        res.status(201).json({ success: true, message: "Review submitted successfully!" });

    } catch (error) {
        console.error("Error submitting review:", error);
        next(error);
    }
};

// GET /api/review/manager
// @access Event Manager
export const getEventManagerReviews = async (req, res, next) => {
    try {
        const eventManagerId = req.user.eventManagerId;

        // 1. Find all events created by this manager
        const events = await Event.find({ eventManagerId });
        const eventIds = events.map(event => event._id);

        // 2. Find all reviews linked to those events
        const reviews = await Review.find({ eventId: { $in: eventIds } })
            .populate('customerId', 'userName email profilePic')
            .populate('eventId', 'title')
            .sort({ createdAt: -1 }); // Newest first

        // 3. Calculate some quick stats
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? (reviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews).toFixed(1)
            : 0;

        res.status(200).json({
            stats: { totalReviews, averageRating },
            reviews
        });

    } catch (error) {
        console.error("Error fetching manager reviews:", error);
        next(error);
    }
};

// GET /api/review/event/:eventId
// @access Event Manager
export const getEventReviews = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const currentManagerId = req.user.eventManagerId;

        // Verify the event belongs to this manager
        const event = await Event.findOne({ _id: eventId, eventManagerId: currentManagerId });
        if (!event) {
             return res.status(403).json({ message: "You are not authorized to view reviews for this event." });
        }

        const reviews = await Review.find({ eventId })
            .populate('customerId', 'userName name email profilePic')
            .populate('eventId', 'title')
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? (reviews.reduce((sum, rev) => sum + rev.rating, 0) / totalReviews).toFixed(1)
            : 0;

        res.status(200).json({
            stats: { totalReviews, averageRating },
            reviews
        });

    } catch (error) {
        console.error("Error fetching event reviews:", error);
        next(error);
    }
};

// GET /api/review/manager/analytics
// @access Event Manager
export const getEventManagerAnalytics = async (req, res, next) => {
    try {
        const eventManagerId = req.user.eventManagerId;

        // 1. Find all events for this manager
        const events = await Event.find({ eventManagerId });
        const eventIds = events.map(event => event._id);

        if (eventIds.length === 0) {
            return res.status(200).json({ deepAnalysis: [], emailLogs: [] });
        }

        // 2. Fetch all successful tickets for these events to provide deep analysis
        const tickets = await Ticket.find({ eventId: { $in: eventIds }, status: true })
            .populate('eventId', 'title category venue location date_time')
            .populate('customerId', 'userName email profilePic')
            .sort({ purchaseDate: -1 });

        if (tickets.length > 0) {
            const sample = tickets[0];
        }

        // 3. Fetch all reviews for these events to link to tickets
        const reviews = await Review.find({ eventId: { $in: eventIds } });
        const reviewMap = new Map();
        reviews.forEach(r => reviewMap.set(r.ticketId.toString(), r));

        // Build the email logs based on tickets
        const emailLogsMap = new Map();

        const deepAnalysis = tickets.map(ticket => {
            // Populate email logs
            if (ticket.isReviewEmailSent && ticket.reviewEmailSentAt) {
                const eventIdStr = ticket.eventId._id.toString();
                // Group by exact date (YYYY-MM-DD) to represent a daily "batch"
                const dateKey = new Date(ticket.reviewEmailSentAt).toISOString().split('T')[0];
                const logKey = `${eventIdStr}_${dateKey}`;
                
                if (!emailLogsMap.has(logKey)) {
                    emailLogsMap.set(logKey, {
                        id: logKey,
                        eventId: ticket.eventId._id,
                        eventTitle: ticket.eventId.title,
                        sentDate: ticket.reviewEmailSentAt,
                        dateString: dateKey,
                        emailsSent: 0,
                        recipients: []
                    });
                }
                const log = emailLogsMap.get(logKey);
                log.emailsSent += 1;
                log.recipients.push({
                    ticketId: ticket.ticketId,
                    customerName: ticket.contactName || ticket.customerId?.userName,
                    customerEmail: ticket.contactEmail || ticket.customerId?.email,
                    hasReviewed: ticket.isReviewed
                });
            }

            const reviewData = reviewMap.get(ticket._id.toString());

            return {
                ticketId: ticket.ticketId,
                eventId: ticket.eventId._id,
                eventTitle: ticket.eventId.title,
                customerId: ticket.customerId?._id,
                customerName: ticket.contactName || ticket.customerId?.userName,
                customerEmail: ticket.contactEmail || ticket.customerId?.email,
                profilePic: ticket.customerId?.profilePic,
                isReviewed: ticket.isReviewed,
                isEmailSent: ticket.isReviewEmailSent,
                emailSentAt: ticket.reviewEmailSentAt,
                purchaseDate: ticket.purchaseDate,
                numberOfTickets: ticket.numberOfTickets,
                // New comprehensive details
                eventDetails: {
                    title: ticket.eventId.title,
                    category: ticket.eventId.category,
                    venue: ticket.eventId.venue,
                    location: ticket.eventId.location,
                    date_time: ticket.eventId.date_time,
                },
                ticketDetails: {
                    contactPhone: ticket.contactPhone,
                    contactEmail: ticket.contactEmail,
                    price: ticket.price,
                    status: ticket.status,
                    petName: ticket.petName,
                    petBreed: ticket.petBreed,
                    petAge: ticket.petAge,
                },
                // End new details
                reviewData: reviewData ? {
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    createdAt: reviewData.createdAt
                } : null
            };
        });

        // Convert Map to Array and sort by date descending
        const emailLogs = Array.from(emailLogsMap.values())
             .sort((a, b) => new Date(b.sentDate) - new Date(a.sentDate));

        res.status(200).json({
            deepAnalysis,
            emailLogs
        });
    } catch (error) {
        console.error("Error fetching review analytics:", error);
        next(error);
    }
};