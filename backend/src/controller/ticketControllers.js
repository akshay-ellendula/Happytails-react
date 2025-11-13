import Ticket from '../models/ticketModel.js';
import Event from '../models/eventModel.js';

//@dec get all tickets
//@routes get/api/tickets/
//@access Admin
export const getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('eventId').populate('customerId');
        res.status(200).json(tickets);
    } catch (error) {
        console.log("Something went Wrong in gettickets controller :", error);
        res.status(500).json({ message: 'Server Error' });
    }
}

//@dec get ticket by id
//@routes get/api/tickets/:id
//@access admin,eventmanager
export const getTicket = async (req, res) => {
    const { id: ticketId } = req.params
    try {
        const ticket = await Ticket.findById(ticketId).populate("eventId").populate("customerId");
        if (!ticket) {
            return res.status(404).json({ message: "ticket not found" })
        }
        res.status(200).json(ticket)
    } catch (error) {
        console.log("Something Went Wrong in getTicket controller : ", error);
        res.status(500).json({ message: 'Server Error' });
    }
}

//@dec delete ticket by id
//@routes delete/api/tickets/:id
//@access Admin,eventManager
export const deleteTicket = async (req, res) => {
    const { id: ticketId } = req.params
    try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "ticket not found" })
        }
        const event = await Event.findById(ticket.eventId);
        if (event) {
            // Fixed: Use tickets_sold instead of total_sold
            event.tickets_sold = event.tickets_sold - ticket.numberOfTickets;
            await event.save();
        }
        await Ticket.findByIdAndDelete(ticketId); // Fixed: Use findByIdAndDelete
        return res.status(200).json({ success: true, message: "Ticket deleted successfully" });
    } catch (error) {
        console.log("Something Went Wrong in deleteTicket controller : ", error);
        res.status(500).json({ message: 'Server Error' });
    }
}

//@dec post ticket 
//@routes post /api/tickets/:id
//@access customer
export const postTicket = async (req, res) => {
    const { id: eventId } = req.params
    const customerId = req.user.customerId;
    const { numberOfTickets, petName, petBreed, petAge } = req.body; // Added pet fields
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const leftTickets = event.total_tickets - event.tickets_sold;
        if (leftTickets < numberOfTickets) {
            return res.status(400).json({ message: `Only ${leftTickets} tickets are left` });
        }
        
        // Calculate total price
        const totalPrice = event.ticketPrice * numberOfTickets;
        
        const newTicket = await Ticket.create({
            eventId,
            customerId,
            numberOfTickets,
            price: totalPrice, // Add the required price field
            petName: petName || '', // Optional pet fields
            petBreed: petBreed || '',
            petAge: petAge || null,
        });

        event.tickets_sold = event.tickets_sold + numberOfTickets;
        await event.save();

        res.status(201).json({ 
            success: true, 
            ticket: newTicket,
            message: `Tickets booked successfully! Total: ₹${totalPrice}`
        });
    } catch (error) {
        console.log("Something Went Wrong in postTicket controller : ", error);
        res.status(500).json({ message: 'Server Error' });
    }
}
//@dec getUserTickets
//@routes get/api/customers/tickets
//@access user
export const getUserTicket = async (req, res) => {
    const customerId = req.user.customerId;
    try {
        // Fixed: Use { customerId } instead of just customerId
        const tickets = await Ticket.find({ customerId }).populate("eventId").populate("customerId");
        if(!tickets || tickets.length === 0){ // Fixed: spelling correction and proper check
            return res.status(404).json({message : "No tickets found for this user"}) // Fixed: Added return
        }
        res.status(200).json(tickets)
    } catch (error) {
        console.log("Error in getUserTickets controller : ", error);
        res.status(500).json({ message: 'Server Error' });
    }
}
//@desc Get all tickets for event manager
//@route GET /api/tickets/manager
//@access Event Manager
export const getEventManagerTickets = async (req, res) => {
    try {
        const eventManagerId = req.user.eventManagerId;
        
        // Get events by this manager
        const events = await Event.find({ eventManagerId });
        const eventIds = events.map(event => event._id);
        
        // Get tickets for these events
        const tickets = await Ticket.find({ eventId: { $in: eventIds } })
            .populate('eventId')
            .populate('customerId')
            .sort({ createdAt: -1 });

        const formattedTickets = tickets.map(ticket => ({
            id: ticket._id,
            ticketId: `TKT-${ticket._id.toString().slice(-10)}`,
            eventName: ticket.eventId?.title,
            customerName: ticket.customerId?.userName,
            customerEmail: ticket.customerId?.email,
            purchaseDate: ticket.createdAt,
            price: ticket.price,
            status: ticket.status ? 'active' : 'cancelled',
            numberOfTickets: ticket.numberOfTickets,
            petDetails: ticket.petName ? `${ticket.petName} (${ticket.petBreed}, ${ticket.petAge} months)` : 'No pet info'
        }));

        res.status(200).json(formattedTickets);

    } catch (error) {
        console.log("Error in getEventManagerTickets controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

//@desc Get single ticket details
//@route GET /api/tickets/:id
//@access Event Manager
export const getTicketDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const eventManagerId = req.user.eventManagerId;

        const ticket = await Ticket.findById(id)
            .populate('eventId')
            .populate('customerId');

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Check if ticket belongs to event manager's event
        if (ticket.eventId.eventManagerId.toString() !== eventManagerId) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json(ticket);

    } catch (error) {
        console.log("Error in getTicketDetails controller:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};