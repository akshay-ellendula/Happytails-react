import crypto from 'crypto';
import Ticket from '../models/ticketModel.js';
import Review from '../models/reviewModel.js';

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