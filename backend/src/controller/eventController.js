import Event from '../models/eventModel.js';
import Ticket from '../models/ticketModel.js';
import uploadToCloudinary from '../utils/cloudinaryUploader.js';

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

        res.status(201).json({
            success: true,
            event,
            message: "Event created successfully"
        });

    } catch (error) {
        console.log("Error in createEvent controller:", error);
        next(error); // Pass error to error handling middleware
    }
};

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
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ date_time: 1 });

        const eventsWithRevenue = await Promise.all(
            events.map(async (event) => {
                const tickets = await Ticket.find({ eventId: event._id });
                const revenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
                const soldPercentage = (event.tickets_sold / event.total_tickets) * 100;
                
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
                    status: event.date_time > new Date() ? 'upcoming' : 'completed',
                    images: event.images
                };
            })
        );

        const total = await Event.countDocuments(query);

        res.status(200).json({
            events: eventsWithRevenue,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        console.log("Error in getEventManagerEvents controller:", error);
        next(error); // Pass error to error handling middleware
    }
};

//@desc Get single event
//@route GET /api/events/:id
//@access Event Manager, Admin
export const getEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json(event);

    } catch (error) {
        console.log("Error in getEvent controller:", error);
        next(error); // Pass error to error handling middleware
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

        res.status(200).json({
            success: true,
            event,
            message: "Event updated successfully"
        });

    } catch (error) {
        console.log("Error in updateEvent controller:", error);
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

        res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });

    } catch (error) {
        console.log("Error in deleteEvent controller:", error);
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

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.eventManagerId.toString() !== eventManagerId) {
            return res.status(403).json({ message: "Access denied" });
        }

        const tickets = await Ticket.find({ eventId: id });
        const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
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
        console.log("Error in getEventAnalytics controller:", error);
        next(error); // Pass error to error handling middleware
    }
};

//@desc Get all events (public)
//@route GET /api/events/public
//@access Public
export const getAllEvents = async (req, res,next) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;

        let query = { date_time: { $gte: new Date() } }; // Only upcoming events

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const events = await Event.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ date_time: 1 });

        const total = await Event.countDocuments(query);

        res.status(200).json({
            events,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        console.log("Error in getAllEvents controller:", error);
        next(error); // Pass error to error handling middleware
    }
};