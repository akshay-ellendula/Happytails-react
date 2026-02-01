import EventManager from '../models/eventManagerModel.js';
import Ticket from '../models/ticketModel.js';
import Event from '../models/eventModel.js';
import uploadToCloudinary from '../utils/cloudinaryUploader.js';
//@desc  Fetch all eventManagers from the database
//@route   GET /api/eventManagers
//@access admin
export const getEventManagers = async (req, res, next) => {
    try {
        const eventManager = await EventManager.find({});
        res.status(200).json(eventManager);
    } catch (error) {
        console.log("something went wrong in geteventManagers controller", error);
        next(error)
    }
}
//@desc  Fetch a single eventManager by ID
//@route  GET /api/eventManagers/:id
//@access Admin
export const geteventManager = async (req, res, next) => {
    const { id: eventManagerId } = req.params;
    try {
        const eventManager = await EventManager.findById(eventManagerId);
        if (!eventManager) {
            return res.status(404).json({ message: 'eventManager not found' });
        }
        res.status(200).json(eventManager);
    } catch (error) {
        console.log("something went wrong in geteventManagerById controller", error);
        next(error); // Pass error to error handling middleware
    }
}
//@decs  modify a eventManager by ID
//@route PUT /api/eventManagers/:id
//@access admin,eventManager
export const putEventManager = async (req, res, next) => {
    const { id: eventManagerId } = req.params;
    try {

        const eventManager = await EventManager.findById(eventManagerId);
        if (!eventManager) {
            return res.status(404).json({ message: "Details not exist" })
        }

        const { userName, email, profilePic, companyName, phoneNumber } = req.body;
        if (!userName || !email || !profilePic || !companyName || !phoneNumber) {
            return res.status(404).json({ message: "All Fields are Required" })
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        if (phoneNumber.length != 10) {
            return res.status(400).json({ message: "Invalid phoneNumber format" });
        }
        const findEventManager = await EventManager.findOne({ email })
        if (findEventManager.email && findEventManager.email.toString() !== email) {
            return res.status(400).json({ message: "All ready email exists" })
        }

        const updateEventManager = await EventManager.findByIdAndUpdate(eventManagerId, {
            userName,
            email,
            profilePic,
            companyName,
            phoneNumber,
        });

        res.status(201).json({ success: true });

    } catch (error) {
       next(error); // Pass error to error handling middleware
    }
}
//@desc  delete a eventManager by ID
//@route   DELETE /api/eventManagers/:id
//@access Admin
export const deleteEventManager = async (req, res, next) => {
    const { id: eventManagerId } = req.params;
    try {
        const eventManager = await EventManager.findById(eventManagerId);
        if (!eventManager) {
            return res.status(404).json({ message: 'eventManager not found' });
        }
        await EventManager.findByIdAndDelete(eventManagerId);
        res.status(200).json({ success: true, message: 'eventManager deleted successfully' });
    } catch (error) {
        console.log("something went wrong in deleteeventManager controller", error);
        next(error); // Pass error to error handling middleware
    }
}
//@desc change Active status of eventManager
//@route PUT /api/eventManagers/changeStatus/:id
//@access Admin
export const changeActiveStatus = async (req, res, next) => {
    const { id: eventManagerId } = req.params;
    try {
        const eventManager = await EventManager.findById(eventManagerId);
        if (!eventManager) {
            return res.status(404).json({ message: 'eventManager not found' });
        }
        eventManager.isActive = !eventManager.isActive;
        await eventManager.save();
        res.status(200).json({ success: true, message: 'eventManager status updated successfully' });
    } catch (error) {
        console.log("something went wrong in changeActiveStatus controller", error);
        next(error); // Pass error to error handling middleware
    }
}
//@dec get all eventAttendees of this event manager
//@route get /api/eventManagers/eventsAttendees/
//@access eventManager,admin
export const getEventsAttendees = async (req, res, next) => {
    const eventManagerId = req.user.eventManagerId;
    try {
        // Step 1: Get all events created by the event manager
        const events = await Event.find({ eventManagerId }).select('_id');

        // Extract event IDs as an array of ObjectIds
        const eventIds = events.map(event => event._id);

        // Step 2: Get all tickets for those event IDs
        const eventAttendees = await Ticket.find({ eventId: { $in: eventIds } })
            .populate('customerId') // Optional: populate customer info
            .populate('eventId');   // Optional: populate event info

        res.status(200).json(eventAttendees);
    } catch (error) {
        console.error("Error in getEventAttendees controller:", error);
        next(error); // Pass error to error handling middleware
    }
}
//@dec get eventAttened list
//@route get /api/events/attendees/:id
//@access eventManager,Admin
export const getEventAttendees = async (req, res, next) => {
    const { id: eventId } = req.params;
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const tickets = await Ticket.find({ eventId }).populate('customerId');
        const attendees = tickets.map(ticket => ({
            customerId: ticket.customerId?._id,
            customerName: ticket.customerId?.userName,
            customerEmail: ticket.customerId?.email,
            purchasedAt: ticket.createdAt,
            noOfTickets: ticket.numberOfTickets,
            petName: ticket.petName,
            petBreed: ticket.petBreed,
            petAge: ticket.petAge
        }));
        
        res.status(200).json({ 
            attendees, 
            eventTitle: event.title
        });
        
    } catch (error) {
        console.log("Something went Wrong in getEventAttendees :", error);
        next(error); // Pass error to error handling middleware
    }
}

//@dec get all events created by this event manager
//@route get /api/eventManagers/events/
//@access eventManager,admin
export const getEventManagerEvents = async (req, res, next) => {
    const eventManagerId = req.user.eventManagerId;
    try {
        const events = await Event.find({ eventManagerId });
        res.status(200).json(events);
    } catch (error) {
        console.error("Error in getEventManagerEvents controller:", error);
        next(error); // Pass error to error handling middleware
    }
}
//@dec get revenue of this event manager
//@route get /api/eventManagers/revenue/
//@access eventManager,admin
export const getEventManagerRevenue = async (req, res, next) => {
    const eventManagerId = req.user.eventManagerId;
    try {
        // Step 1: Get all events created by the event manager
        const events = await Event.find({ eventManagerId }).select('_id');

        // Extract event IDs as an array of ObjectIds
        const eventIds = events.map(event => event._id);

        // Step 2: Get all tickets for those event IDs and calculate total revenue
        const tickets = await Ticket.find({ eventId: { $in: eventIds } });
        const totalRevenue = tickets.reduce((acc, ticket) => acc + ticket.price, 0);

        res.status(200).json(totalRevenue);
    } catch (error) {
        console.error("Error in getEventManagerRevenue controller:", error);
        next(error); // Pass error to error handling middleware
    }
}
//@desc Change password
//@route PUT /api/event-manager/change-password
//@access Event Manager
export const changePassword = async (req, res, next) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const eventManager = await EventManager.findById(eventManagerId);
        if (!eventManager) {
            return res.status(404).json({ message: "Event manager not found" });
        }

        const isMatch = await eventManager.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        eventManager.password = newPassword;
        await eventManager.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.log("Error in changePassword controller:", error);
        next(error); // Pass error to error handling middleware
    }
};
//@desc Get my profile
//@route GET /api/eventManagers/profile/me
//@access Event Manager
export const getMyProfile = async (req, res, next) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        const eventManager = await EventManager.findById(eventManagerId).select('-password');
        
        if (!eventManager) {
            return res.status(404).json({ message: "Event manager not found" });
        }

        res.status(200).json(eventManager);
    } catch (error) {
        console.log("Error in getMyProfile controller:", error);
        next(error); // Pass error to error handling middleware
    }
};

//@desc Update my profile
//@route PUT /api/eventManagers/profile/me
//@access Event Manager
export const updateMyProfile = async (req, res, next) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        
        // req.body contains text fields
        console.log(req.body)
        const { userName, email, companyName, phoneNumber } = req.body;

        const eventManager = await EventManager.findById(eventManagerId);
        if (!eventManager) {
            return res.status(404).json({ message: "Event manager not found" });
        }

        // Update fields if provided
        if (userName) eventManager.userName = userName;
        
        if (email) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Invalid email format" });
            }
            eventManager.email = email;
        }

        if (companyName) eventManager.companyName = companyName;
        
        if (phoneNumber) {
            if (phoneNumber.length !== 10) {
                return res.status(400).json({ message: "Invalid phone number format" });
            }
            eventManager.phoneNumber = phoneNumber;
        }

        // FIX: Handle Image Upload
        if (req.file) {
            try {
                const imageUrl = await uploadToCloudinary(req.file, 'event-managers');
                eventManager.profilePic = imageUrl;
            } catch (uploadError) {
                return res.status(500).json({ message: "Error uploading image" });
            }
        }

        await eventManager.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            eventManager: {
                userName: eventManager.userName,
                email: eventManager.email,
                profilePic: eventManager.profilePic,
                companyName: eventManager.companyName,
                phoneNumber: eventManager.phoneNumber
            }
        });

    } catch (error) {
        console.log("Error in updateMyProfile controller:", error);
        next(error); // Pass error to error handling middleware
    }
};