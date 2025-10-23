import EventManager from '../models/eventManagerModel.js';
import Ticket from '../models/ticketModel.js';
import Event from '../models/eventModel.js';
//@desc  Fetch all eventManagers from the database
//@route   GET /api/eventManagers
//@access admin
export const getEventManagers = async (req, res) => {
    try {
        const eventManager = await EventManager.find({});
        res.status(200).json(eventManager);
    } catch (error) {
        console.log("something went wrong in geteventManagers controller", error);
        res.status(500).json({ message: 'Server Error' });
    }
}
//@desc  Fetch a single eventManager by ID
//@route  GET /api/eventManagers/:id
//@access Admin
export const geteventManager = async (req, res) => {
    const { id: eventManagerId } = req.params;
    try {
        const eventManager = await EventManager.findById(eventManagerId);
        if (!eventManager) {
            return res.status(404).json({ message: 'eventManager not found' });
        }
        res.status(200).json(eventManager);
    } catch (error) {
        console.log("something went wrong in geteventManagerById controller", error);
        res.status(500).json({ message: 'Server Error' });
    }
}
//@decs  modify a eventManager by ID
//@route PUT /api/eventManagers/:id
//@access admin,eventManager
export const putEventManager = async (req, res) => {
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
        console.log("something went worng in updateEventManager controller  ", error)
    }
}
//@desc  delete a eventManager by ID
//@route   DELETE /api/eventManagers/:id
//@access Admin
export const deleteEventManager = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
}
//@desc change Active status of eventManager
//@route PUT /api/eventManagers/changeStatus/:id
//@access Admin
export const changeActiveStatus = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
}
//@dec get all eventAttendees of this event manager
//@route get /api/eventManagers/eventsAttendees/
//@access eventManager,admin
export const getEventsAttendees = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
}
//@dec get eventAttened list
//@route get /api/events/attendees/:id
//@access eventManager,Admin
export const getEventAttendees = async (req, res) => {
    const { id: eventId } = req.params;
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "event not found" })
        }

        const tickets = await Ticket.find({ eventId }).populate('customerId');
        const attendees = tickets.map(ticket => ({
            customerId: ticket.customerId,
            customerName: ticket.customerId?.userName,
            customerEmail: ticket.customerId?.email,
            purchasedAt: ticket.createdAt,
            noOfTickets: ticket.numberOfTickets,
        }))
        res.status(200).json({ attendees, eventTitle: title });
    } catch (error) {
        console.log("Something went Wrong in getEventAttendees :", error);
        res.status(500).json({ message: 'Server Error' });
    }
}

//@dec get all events created by this event manager
//@route get /api/eventManagers/events/
//@access eventManager,admin
export const getEventManagerEvents = async (req, res) => {
    const eventManagerId = req.user.eventManagerId;
    try {
        const events = await Event.find({ eventManagerId });
        res.status(200).json(events);
    } catch (error) {
        console.error("Error in getEventManagerEvents controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
}
//@dec get revenue of this event manager
//@route get /api/eventManagers/revenue/
//@access eventManager,admin
export const getEventManagerRevenue = async (req, res) => {
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
        res.status(500).json({ message: 'Server Error' });
    }
}
