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
            const total_sold = event.total_sold - ticket.numberOfTickets;
            await Ticket.findOneAndDelete({ ticketId }, {
                total_sold
            })
            return res.status(200).json({ success: true });
        }
        await Ticket.findOneAndDelete({ ticketId })
        return res.status(200).json({ success: true });
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
    const { numberOfTickets } = req.body;
    try {

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const leftTickets = event.total_tickets - event.tickets_sold;
        if (leftTickets < numberOfTickets) {
            res.status(200).json({ message: `only ${leftTickets} are left` })
        }
        
        const newTicket = await Ticket.create({
            eventId,
            customerId,
            numberOfTickets,
        });

        event.total_sold = (event.total_sold) + numberOfTickets;
        await event.save();

        res.status(201).json({ success: true });
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
        const tickets = await Ticket.find(customerId).populate("eventId").populate("customerId");
        if(!tickets || tickets.lenght){
            res.status(404).json({message : "No tickets found for this user"})
        }
        res.status(200).json(tickets)
    } catch (error) {
        console.log("Error in getUserTickets controller : ", error);
        res.status(500).json({ message: 'Server Error' });
    }
}
