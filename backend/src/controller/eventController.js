import Event from '../models/eventModel.js';
import EventManager from '../models/eventManagerModel.js';
import Ticket from '../models/ticketModel.js';
import uploadToCloudinary from '../utils/cloudinaryUploader.js';

//@dec get events
//@route /api/events/
//@access admin
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find({}).populate('eventManagerId');
        res.status(200).json(events);
    } catch (error) {
        console.log("something went wrong in get events controllers", error);
        res.status(500).json({ message: 'Server Error' });
    }
}

//@dec getPublicEvents
//@route /api/getPublicEvents/
//@access public
export const getPublicEvents = async(req,res) =>{
    try {
        const now = new Date();
        const upcomingEvents = await Event.find({ 
            date_time: { $gte: now } 
        }).populate('eventManagerId');
        
        if(upcomingEvents.length === 0){
            res.status(404).json({message : "No Upcoming Events Found"});
        } else {
            res.status(200).json(upcomingEvents);
        }
    } catch (error) {
        console.log("Something Went Wrong in getPublicEvents controller",error);
        res.status(500).json({ message: 'Server Error' });
    }
}

//@dec get event Details by id
//@route get /api/events/:id
//@access public
export const getEvent = async (req, res) => {
    const { id: eventId } = req.params;
    try {
        const event = await Event.findById(eventId).populate('eventManagerId');
        if (!event) {
            return res.status(404).json({ message: "Event not Found" });
        }        
        res.status(200).json(event);
    } catch (error) {
        console.log("Something went Wrong in getEvent :", error);
        res.status(500).json({ message: 'Server Error' });
    }
}

//@dec post an event
//@route post /api/events/
//@access eventManager
export const postEvent = async (req, res) => {
    const eventManagerId = req.user.eventManagerId;

    const {
        title, description, language, duration, ageLimit,
        ticketPrice, category, date_time, total_tickets,
        venue, location
    } = req.body;

    const thumbnailFile = req.files?.thumbnail ? req.files.thumbnail[0] : null;
    const bannerFile = req.files?.banner ? req.files.banner[0] : null;

    try {
        if (
            !title || !description || !language || !date_time || !category ||
            !venue || !location
        ) {
            return res.status(400).json({ message: "All required fields are missing" });
        }
        
        if (!thumbnailFile || !bannerFile) {
            return res.status(400).json({ message: "Both thumbnail and banner images are required" });
        }

        if (total_tickets <= 0) {
            return res.status(400).json({ message: "Total tickets must be a positive integer" });
        }

        const eventManager = await EventManager.findById(eventManagerId);
        if (!eventManager) {
            return res.status(404).json({ message: "EventManager not found" });
        }

        const existingEvent = await Event.findOne({ title });
        if (existingEvent) {
            return res.status(409).json({ message: "Event title already in use" });
        }

        // Cloudinary upload configurations
        const thumbnailTransformations = [
            { width: 400, height: 300, crop: "fill" },
            { quality: "auto" },
            { format: "auto" },
        ];

        const bannerTransformations = [
            { width: 1200, height: 400, crop: "fill" },
            { quality: "auto" },
            { format: "auto" },
        ];

        let thumbnailUrl = "";
        let bannerUrl = "";

        try {
            const [uploadedThumbnail, uploadedBanner] = await Promise.all([
                uploadToCloudinary(thumbnailFile, "event_thumbnails", thumbnailTransformations),
                uploadToCloudinary(bannerFile, "event_banners", bannerTransformations)
            ]);

            thumbnailUrl = uploadedThumbnail;
            bannerUrl = uploadedBanner;

        } catch (uploadError) {
            return res.status(500).json({ error: uploadError.message });
        }
        
        const newEvent = await Event.create({
            eventManagerId,
            title,
            description,
            language,
            duration,
            ageLimit,
            ticketPrice,
            category,
            date_time,
            total_tickets,
            venue,
            location,
            images: {
                thumbnail: thumbnailUrl,
                banner: bannerUrl
            }
        });

        res.status(201).json({message : "Event created Successfully", event: newEvent});
    } catch (error) {
        console.log('Error in postEvent controller: ', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

//@dec modify event
//@route put /api/events/:id
//@access eventManager
export const putEvent = async (req, res) => {
    const eventManagerId = req.user.eventManagerId; 
    const { id: eventId } = req.params;

    const files = req.files;
    const thumbnailFile = files?.thumbnail ? files.thumbnail[0] : null;
    const bannerFile = files?.banner ? files.banner[0] : null;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.eventManagerId.toString() !== eventManagerId) {
            return res.status(403).json({ 
                message: "Forbidden: You do not have permission to edit this event" 
            });
        }

        const updateData = {};

        const {
            title, description, language, duration, ageLimit,
            ticketPrice, category, date_time, total_tickets,
            venue, location
        } = req.body;

        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (language) updateData.language = language;
        if (duration) updateData.duration = duration;
        if (ageLimit) updateData.ageLimit = ageLimit;
        if (ticketPrice) updateData.ticketPrice = ticketPrice;
        if (category) updateData.category = category;
        if (date_time) updateData.date_time = date_time;
        if (total_tickets) updateData.total_tickets = total_tickets;
        if (venue) updateData.venue = venue;
        if (location) updateData.location = location;

        // Cloudinary upload configurations
        const thumbnailTransformations = [
            { width: 400, height: 300, crop: "fill" },
            { quality: "auto" },
            { format: "auto" },
        ];

        const bannerTransformations = [
            { width: 1200, height: 400, crop: "fill" },
            { quality: "auto" },
            { format: "auto" },
        ];

        // Handle image updates
        if (thumbnailFile || bannerFile) {
            updateData.images = { ...event.images };
            
            if (thumbnailFile) {
                const uploadedThumbnail = await uploadToCloudinary(
                    thumbnailFile, 
                    "event_thumbnails", 
                    thumbnailTransformations
                );
                updateData.images.thumbnail = uploadedThumbnail;
            }

            if (bannerFile) {
                const uploadedBanner = await uploadToCloudinary(
                    bannerFile, 
                    "event_banners", 
                    bannerTransformations
                );
                updateData.images.banner = uploadedBanner;
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            { $set: updateData }, 
            { new: true, runValidators: true } 
        );

        res.status(200).json({message : "Event updated Successfully", event: updatedEvent}); 

    } catch (error) {
        console.log("Error in putEvent controller: ", error);
        if (error.message.includes("Cloudinary")) {
            return res.status(500).json({ message: "Image upload failed." });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

//@dec delete Event by id
//@route delete /api/events/:id
//@access Admin,EventManager
export const deleteEvent = async (req, res) => {
    const { id: eventId } = req.params;
    const role = req.user.role;
    const eventManagerId = req.user.eventManagerId;
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event is not found" });
        }
        if (role == "eventManager" && event.eventManagerId.toString() !== eventManagerId) {
            return res.status(403).json({ message: "Not Authorised" })
        }
        
        // Update related tickets if needed
        await Ticket.updateMany({ eventId: eventId });
        await Event.findByIdAndDelete(eventId);
        
        res.status(200).json({ success: true, message: "Event deleted successfully" })
    } catch (error) {
        console.log("Something went Wrong in deleteEvent :", error);
        res.status(500).json({ message: 'Server Error' });
    }
}

//@dec Change Event Status by id
//@route put /api/eventManager/changeStatus/:id
//@access eventManager,Admin
export const changeEventStatus = async(req,res) => {
    const {id : eventId } = req.params;
    const {status} = req.body;
    const role = req.user.role;
    const eventManagerId = req.user.eventManagerId;
    try {
        const validStatuses = ['Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status" 
            });
        }
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        if (role === "eventManager" && event.eventManagerId.toString() !== eventManagerId) {
            return res.status(403).json({ 
                message: "Forbidden: You do not have permission to change status of this event" 
            });
        }
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            { $set: { status } },
            { new: true, runValidators: true }
        );
        res.status(200).json({ message: "Event status updated successfully"});
    } catch (error) {
        console.log("Something went wrong in changeEventStatus:", error);
        res.status(500).json({ message: 'Server Error' });
    }
}