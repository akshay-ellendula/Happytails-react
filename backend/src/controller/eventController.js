import Event from '../models/eventModel.js';
import Ticket from '../models/ticketModel.js';
import Customer from '../models/customerModel.js'; // <-- ADD THIS IMPORT
import uploadToCloudinary from '../utils/cloudinaryUploader.js';
import sendEmail from '../utils/sendEmail.js'; // <-- ADD THIS IMPORT
import Review from '../models/reviewModel.js';
import Stripe from 'stripe';
import { invalidateCache } from '../middleware/cacheMiddleware.js';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;
//@desc Create new event
//@route POST /api/events
//@access Event Manager
export const createEvent = async (req, res, next) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const {
            title, description, language, duration, ageLimit,
            ticketPrice, date_time, category, venue, location, total_tickets
        } = req.body;

        if (!title || !description || !ticketPrice || !date_time || !total_tickets || !venue || !location) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Handle file uploads
        let thumbnailUrl = '';
        let bannerUrl = '';

        if (req.files) {
            if (req.files.thumbnail) {
                thumbnailUrl = await uploadToCloudinary(req.files.thumbnail[0], 'event-thumbnails');
            }
            if (req.files.banner) {
                bannerUrl = await uploadToCloudinary(req.files.banner[0], 'event-banners');
            }
        }

        const event = await Event.create({
            eventManagerId,
            title,
            description,
            language: language || 'English',
            duration,
            ageLimit,
            ticketPrice,
            date_time,
            category,
            venue,
            location,
            total_tickets,
            tickets_sold: 0,
            images: {
                thumbnail: thumbnailUrl,
                banner: bannerUrl
            }
        });

        // Send response immediately so the event manager doesn't have to wait 
        // for all the emails to finish sending
        // Invalidate cached event listings so new event appears immediately
        await invalidateCache('cache:/api/events');

        res.status(201).json({
            success: true,
            event,
            message: "Event created successfully"
        });

        // --- NEW BACKGROUND EMAIL NOTIFICATION LOGIC ---
        // We fetch all customers and send emails individually to protect their privacy
        Customer.find({}).select('email userName')
            .then(async (customers) => {
            const formattedDate = new Date(date_time).toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            const emailMessage = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
</style>

<div style="font-family: 'DM Sans', 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #000000;">

    <!-- Header -->
    <div style="background-color: #FFD700; padding: 36px 30px; text-align: center; border-bottom: 3px solid #000000;">
        <h1 style="color: #000000; margin: 0; font-size: 38px; font-family: 'Playfair Display', Georgia, serif; font-weight: 900; letter-spacing: 2px;">🐾 HappyTails</h1>
        <div style="width: 60px; height: 3px; background-color: #000000; margin: 12px auto;"></div>
        <p style="color: #000000; margin: 0; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif; font-weight: 600;">New Event Announcement</p>
    </div>

    <!-- Hero Event Title Banner -->
    <div style="background-color: #000000; padding: 32px 36px; text-align: center;">
        <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; color: #FFD700; font-family: 'DM Sans', sans-serif; font-weight: 600;">Just Announced</p>
        <h2 style="margin: 0; font-size: 30px; color: #ffffff; font-family: 'Playfair Display', Georgia, serif; font-weight: 700; line-height: 1.3;">${title}</h2>
        <div style="width: 40px; height: 3px; background-color: #FFD700; margin: 16px auto 0;"></div>
    </div>

    <!-- Body -->
    <div style="padding: 40px 36px; background-color: #ffffff;">

        <p style="font-size: 16px; color: #222222; font-family: 'DM Sans', sans-serif; margin-top: 0;">
            Hey there! 👋 A brand-new event has just been added to HappyTails and we think you'll love it.
        </p>

        <!-- Event Details Card -->
        <div style="background-color: #000000; padding: 28px; margin: 28px 0;">
            <h3 style="margin-top: 0; color: #FFD700; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif; font-weight: 600;">📅 Event Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #2a2a2a;">
                    <td style="padding: 11px 0; color: #888888; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif; width: 40%;">Event</td>
                    <td style="padding: 11px 0; text-align: right; color: #ffffff; font-size: 15px; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">${title}</td>
                </tr>
                <tr style="border-bottom: 1px solid #2a2a2a;">
                    <td style="padding: 11px 0; color: #888888; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">When</td>
                    <td style="padding: 11px 0; text-align: right; color: #ffffff; font-size: 14px; font-family: 'DM Sans', sans-serif;">${formattedDate}</td>
                </tr>
                <tr style="border-bottom: 1px solid #2a2a2a;">
                    <td style="padding: 11px 0; color: #888888; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">Where</td>
                    <td style="padding: 11px 0; text-align: right; color: #ffffff; font-size: 14px; font-family: 'DM Sans', sans-serif;">${venue}, ${location}</td>
                </tr>
                <tr style="border-bottom: 1px solid #2a2a2a;">
                    <td style="padding: 11px 0; color: #888888; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">Ticket Price</td>
                    <td style="padding: 11px 0; text-align: right; color: #FFD700; font-size: 22px; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">₹${ticketPrice}</td>
                </tr>
                <tr>
                    <td style="padding: 11px 0; color: #888888; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">Total Spots</td>
                    <td style="padding: 11px 0; text-align: right; color: #FFD700; font-size: 22px; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">${total_tickets}</td>
                </tr>
            </table>
        </div>

        <!-- Urgency Notice -->
        <div style="border: 2px solid #000000; background-color: #FFFBEA; padding: 16px 20px; margin-bottom: 32px;">
            <p style="margin: 0; font-size: 13px; color: #333333; font-family: 'DM Sans', sans-serif;">
                ⚡ <strong>Spots are limited!</strong> Only <strong>${total_tickets} tickets</strong> available. Grab yours before they're gone.
            </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0 20px;">
            <a href="http://localhost:5173/events"
               style="background-color: #FFD700; color: #000000; padding: 16px 40px; text-decoration: none; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; display: inline-block; border: 2px solid #000000;">
                View Event &amp; Book Tickets →
            </a>
        </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #000000; padding: 26px 30px; text-align: center; border-top: 3px solid #FFD700;">
        <p style="margin: 0; font-size: 11px; color: #FFD700; letter-spacing: 4px; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">With love & wags</p>
        <p style="margin: 8px 0 0; font-size: 20px; color: #ffffff; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">The HappyTails Team 🐾</p>
    </div>

</div>
`;

            // Loop through and send individually so customers don't see each other's emails
            for (const customer of customers) {
                if (customer.email) {
                    try {
                        await sendEmail({
                            email: customer.email,
                            subject: `🐾 New Event Alert: ${title} is here!`,
                            message: emailMessage
                        });
                    } catch (err) {
                        console.error(`Failed to send event notification to ${customer.email}:`, err.message);
                    }
                }
            }
        })
            .catch(err => {
                console.error("Error fetching customers for event notification:", err);
            });
        // --- END NOTIFICATION LOGIC ---

    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

// ... keep the rest of your controller functions (getEventManagerEvents, etc.) exactly the same below this
//@desc Get all events for event manager
//@route GET /api/events/manager
//@access Event Manager
export const getEventManagerEvents = async (req, res, next) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const { page = 1, limit = 10, status, search } = req.query;

        let query = { eventManagerId };

        if (status === 'upcoming') {
            query.date_time = { $gte: new Date() };
        } else if (status === 'completed') {
            query.date_time = { $lt: new Date() };
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const events = await Event.find(query)
            .lean()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ date_time: 1 });

        const eventIds = events.map(e => e._id);
        const allTickets = await Ticket.find({ eventId: { $in: eventIds }, status: { $ne: false } }).lean();
        
        const eventRevenueMap = new Map();
        allTickets.forEach(t => {
            const eid = t.eventId.toString();
            eventRevenueMap.set(eid, (eventRevenueMap.get(eid) || 0) + t.price);
        });

        const eventsWithRevenue = events.map((event) => {
            const revenue = eventRevenueMap.get(event._id.toString()) || 0;
            const soldPercentage = event.total_tickets > 0 ? (event.tickets_sold / event.total_tickets) * 100 : 0;

            return {
                id: event._id,
                title: event.title,
                category: event.category,
                date_time: event.date_time,
                venue: event.venue,
                location: event.location,
                total_tickets: event.total_tickets,
                tickets_sold: event.tickets_sold,
                soldPercentage: Math.round(soldPercentage),
                revenue: Math.round(revenue * 100) / 100,
                status: event.isCancelled ? 'cancelled' : (event.date_time > new Date() ? 'upcoming' : 'completed'),
                images: event.images
            };
        });

        const total = await Event.countDocuments(query);

        res.status(200).json({
            events: eventsWithRevenue,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

//@desc Get single event
//@route GET /api/events/:id
//@access Event Manager, Admin
export const getEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Fetch the event, populate manager details, and use .lean() to attach new properties
        const event = await Event.findById(id).populate(
            'eventManagerId',
            'userName profilePic companyName'
        ).lean();

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // 2. Calculate the manager's overall average rating
        if (event.eventManagerId) {
            // Find all events created by this manager
            const managerEvents = await Event.find({ eventManagerId: event.eventManagerId._id }).select('_id');
            const managerEventIds = managerEvents.map(e => e._id);

            // Find all reviews for those events
            const reviews = await Review.find({ eventId: { $in: managerEventIds } });

            let averageRating = 0;
            let totalReviews = reviews.length;

            if (totalReviews > 0) {
                const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
                averageRating = (sum / totalReviews).toFixed(1);
            }

            // 3. Attach the calculated review stats directly to the manager object
            event.eventManagerId.averageRating = parseFloat(averageRating);
            event.eventManagerId.totalReviews = totalReviews;
        }

        res.status(200).json(event);

    } catch (error) {
        next(error);
    }
};

//@desc Update event
//@route PUT /api/events/:id
//@access Event Manager
export const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const eventManagerId = req.user.eventManagerId;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.eventManagerId.toString() !== eventManagerId) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (req.files) {
            if (req.files.thumbnail) {
                event.images.thumbnail = await uploadToCloudinary(req.files.thumbnail[0], 'event-thumbnails');
            }
            if (req.files.banner) {
                event.images.banner = await uploadToCloudinary(req.files.banner[0], 'event-banners');
            }
        }

        const updatableFields = [
            'title', 'description', 'language', 'duration', 'ageLimit',
            'ticketPrice', 'date_time', 'category', 'venue', 'location', 'total_tickets'
        ];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                event[field] = req.body[field];
            }
        });

        await event.save();

        // Invalidate cache in the background (don't block the response)
        invalidateCache('cache:/api/events').catch(() => {});

        res.status(200).json({
            success: true,
            event,
            message: "Event updated successfully"
        });

    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

//@desc Delete event
//@route DELETE /api/events/:id
//@access Event Manager
export const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const eventManagerId = req.user.eventManagerId;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.eventManagerId.toString() !== eventManagerId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const ticketsCount = await Ticket.countDocuments({ eventId: id });
        if (ticketsCount > 0) {
            return res.status(400).json({
                message: "Cannot delete event with existing tickets. Please cancel the event instead."
            });
        }

        await Event.findByIdAndDelete(id);

        // Invalidate cached event data
        await invalidateCache('cache:/api/events');

        res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });

    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

//@desc Get event analytics
//@route GET /api/events/:id/eventAnalytics
//@access Event Manager
export const getEventAnalytics = async (req, res, next) => {
    try {
        const { id } = req.params;
        const eventManagerId = req.user.eventManagerId;

        const event = await Event.findById(id).lean();
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.eventManagerId.toString() !== eventManagerId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const tickets = await Ticket.find({ eventId: id }).lean();
        const activeTickets = tickets.filter(t => t.status !== false);
        const totalRevenue = activeTickets.reduce((sum, ticket) => sum + ticket.price, 0);
        const platformFee = totalRevenue * 0.06;
        const netRevenue = totalRevenue - platformFee;

        const analytics = {
            event: {
                title: event.title,
                date: event.date_time,
                total_tickets: event.total_tickets,
                tickets_sold: event.tickets_sold,
                ticketPrice: event.ticketPrice
            },
            revenue: {
                total: totalRevenue,
                platformFee: platformFee,
                netRevenue: netRevenue
            },
            attendance: {
                sold: event.tickets_sold,
                capacity: event.total_tickets,
                percentage: (event.tickets_sold / event.total_tickets) * 100
            },
            tickets: {
                total: tickets.length,
                active: tickets.filter(t => t.status).length,
                used: tickets.filter(t => !t.status).length
            }
        };

        res.status(200).json(analytics);

    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

//@desc Get all events (public)
//@route GET /api/events/public
//@access Public
export const getAllEvents = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;

        // Only upcoming events that are NOT cancelled
        let query = {
            date_time: { $gte: new Date() },
            isCancelled: { $ne: true }
        };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const [events, total] = await Promise.all([
            Event.find(query)
                .lean()
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ date_time: 1 }),
            Event.countDocuments(query)
        ]);

        res.status(200).json({
            events,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};
//@desc Cancel event, refund tickets (minus platform fee), revoke review access, and notify users
//@route PUT /api/events/:id/cancel
//@access Event Manager
export const cancelEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body; // <-- GET REASON FROM FRONTEND
        const eventManagerId = req.user.eventManagerId;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Verify ownership
        if (event.eventManagerId.toString() !== eventManagerId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const tickets = await Ticket.find({ eventId: id, status: true });

        if (tickets.length > 0 && !stripe) {
            return res.status(500).json({ message: "Stripe test mode is not configured. Cannot process refunds." });
        }

        for (const ticket of tickets) {
            const platformFee = ticket.price * 0.06;
            const refundAmount = ticket.price - platformFee;
            const refundAmountInPaise = Math.round(refundAmount * 100);

            // A. Issue Stripe Refund
            if (ticket.paymentIntentId) {
                try {
                    await stripe.refunds.create({
                        payment_intent: ticket.paymentIntentId,
                        amount: refundAmountInPaise,
                    });
                } catch (stripeError) {
                    console.error(`Refund failed for ticket ${ticket._id}:`, stripeError.message);
                }
            }

            // B. Invalidate ticket and revoke review capabilities
            ticket.status = false;
            ticket.reviewToken = null;
            ticket.reviewTokenExpires = null;
            ticket.isReviewed = true;
            await ticket.save();

            // C. Send Email Notification to Customer (WITH REASON)
            const emailMessage = `
                <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #000;">
                    <div style="background-color: #000; padding: 20px; text-align: center;">
                        <h2 style="color: #FFD700; margin: 0;">🚨 Event Cancelled</h2>
                    </div>
                    <div style="padding: 30px;">
                        <p>Hi <strong>${ticket.contactName}</strong>,</p>
                        <p>We are very sorry to inform you that the event <strong>${event.title}</strong> has been cancelled by the organizer.</p>
                        
                        <div style="background-color: #f8eaeb; border-left: 4px solid #dc2626; padding: 12px; margin: 16px 0;">
                            <p style="margin: 0; color: #dc2626; font-size: 14px;"><strong>Reason given by organizer:</strong><br/> ${reason || "No specific reason provided."}</p>
                        </div>

                        <p>We have processed a refund of <strong>₹${refundAmount.toFixed(2)}</strong> (Ticket price minus standard platform fees) back to your original payment method. Please allow 5-7 business days for the funds to appear in your account.</p>
                        <p>We apologize for the inconvenience and hope to see you at another HappyTails event soon!</p>
                    </div>
                </div>
            `;

            try {
                await sendEmail({
                    email: ticket.contactEmail,
                    subject: `🚨 Event Cancelled: ${event.title}`,
                    message: emailMessage
                });
            } catch (emailErr) {
                console.error(`Failed to send cancellation email to ${ticket.contactEmail}:`, emailErr.message);
            }
        }

        // Mark event as cancelled instead of deleting it
        event.isCancelled = true;
        await event.save();

        // Invalidate cached event data
        await invalidateCache('cache:/api/events');

        res.status(200).json({
            success: true,
            message: `Event cancelled successfully. ${tickets.length} tickets refunded.`
        });

    } catch (error) {
        next(error);
    }
};