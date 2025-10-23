import Event from '../models/eventModel.js';
import EventManager from '../models/eventManagerModel.js';
import Ticket from '../models/ticketModel.js';
import uploadToCloudinary from '../utils/cloudinaryUploader.js';

const determineEventStatus = (eventDateTime) => {
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get event date (without time)
    const eventDate = new Date(eventDateTime);
    const eventDateOnly = new Date(eventDate);
    eventDateOnly.setHours(0, 0, 0, 0);
    
    if (today < eventDateOnly) {
        return 'Upcoming';
    } else if (today.getTime() === eventDateOnly.getTime()) {
        return 'Ongoing';
    } else {
        return 'Completed';
    }
};

const updateEventStatusIfNeeded = async (event) => {
    const currentStatus = event.status;
    const calculatedStatus = determineEventStatus(event.date_time);
    
    if (currentStatus !== calculatedStatus && calculatedStatus !== 'Upcoming') {
        // Only auto-update to Ongoing or Completed, not back to Upcoming
        await Event.findByIdAndUpdate(event._id, { status: calculatedStatus });
        event.status = calculatedStatus;
    }
    
    return event;
};

//@dec get events
//@route /api/events/
//@access admin
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find({}).populate('eventManagerId');
        
        // Update status for each event based on current date
        const updatedEvents = await Promise.all(
            events.map(async (event) => {
                return await updateEventStatusIfNeeded(event);
            })
        );
        
        res.status(200).json(updatedEvents);
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
        // First get all events and update their status
        const allEvents = await Event.find({}).populate('eventManagerId');
        
        // Update status for each event based on current date
        const updatedEvents = await Promise.all(
            allEvents.map(async (event) => {
                return await updateEventStatusIfNeeded(event);
            })
        );
        
        // Filter for upcoming events after status update
        const upcomingEvents = updatedEvents.filter(event => event.status === 'Upcoming');
        
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
        res.status(200).json(updatedEvent);
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
        title, description, language, duration, ageLimtit,
        ticketPrice, category, date_time, total_tickets,
        requirements, instructions, location, venue, terms
    } = req.body;

    
    const posterFile_1 = req.files.posterUrl_1 ? req.files.posterUrl_1[0] : null;
    const posterFile_2 = req.files.posterUrl_2 ? req.files.posterUrl_2[0] : null;

    try {
        
        if (
            !title || !description || !language || !date_time || !category ||
            !requirements || !instructions || !location || !venue || !terms
        ) {
            return res.status(400).json({ message: "All text fields are required" });
        }
        if (!posterFile_1) {
            return res.status(400).json({ message: "Event poster 1 (posterUrl_1) is required" });
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

        let posterUrl_1 = "";
        let posterUrl_2 = ""; 

        const posterTransformations = [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto" },
            { format: "auto" },
        ];

        try {
            const uploadPromises = [
                uploadToCloudinary(posterFile_1, "event_posters", posterTransformations),
                uploadToCloudinary(posterFile_2, "event_posters", posterTransformations)
            ];

            const [uploadedUrl_1, uploadedUrl_2] = await Promise.all(uploadPromises);

            posterUrl_1 = uploadedUrl_1; 
            posterUrl_2 = uploadedUrl_2; 

        } catch (uploadError) {
            return res.status(500).json({ error: uploadError.message });
        }
        
        const newEvent = await Event.create({
            eventManagerId,
            title,
            description,
            language,
            duration,
            ageLimtit,
            ticketPrice,
            category,
            date_time,
            total_tickets,
            posterUrl_1,    
            posterUrl_2,    
            requirements,
            instructions,
            location,
            venue,
            terms,
        });

        res.status(201).json({message : "Event created Sucessfully"});
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
    const posterFile_1 = files?.posterUrl_1 ? files.posterUrl_1[0] : null;
    const posterFile_2 = files?.posterUrl_2 ? files.posterUrl_2[0] : null;

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
            title, description, language, duration, ageLimtit,
            ticketPrice, category, date_time, total_tickets,
            requirements, instructions, location, venue, terms
        } = req.body;

        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (language) updateData.language = language;
        if (duration) updateData.duration = duration;
        if (ageLimtit) updateData.ageLimtit = ageLimtit;
        if (ticketPrice) updateData.ticketPrice = ticketPrice;
        if (category) updateData.category = category;
        if (date_time) updateData.date_time = date_time;
        if (total_tickets) updateData.total_tickets = total_tickets;
        if (requirements) updateData.requirements = requirements;
        if (instructions) updateData.instructions = instructions;
        if (location) updateData.location = location;
        if (venue) updateData.venue = venue;
        if (terms) updateData.terms = terms;

        const posterTransformations = [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto" },
            { format: "auto" },
        ];

        if (posterFile_1) {
            const uploadedUrl_1 = await uploadToCloudinary(
                posterFile_1, 
                "event_posters", 
                posterTransformations
            );
            updateData.posterUrl_1 = uploadedUrl_1;
        }

        if (posterFile_2) {
            const uploadedUrl_2 = await uploadToCloudinary(
                posterFile_2, 
                "event_posters", 
                posterTransformations
            );
            updateData.posterUrl_2 = uploadedUrl_2;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            { $set: updateData }, 
            { new: true, runValidators: true } 
        );

        res.status(200).json({message : "Event updated Successfully"}); 

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
        const ticket = await Ticket.updateMany({eventId : eventId});
        await Event.findByIdAndDelete(eventId);
        res.status(200).json({ success: true })
    } catch (error) {
        console.log("Something went Wrong in deleteEvent :", error);
        res.status(500).json({ message: 'Server Error' });
    }
}
//@dec  Change Event Status by id
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