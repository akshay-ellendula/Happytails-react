import Ticket from '../models/ticketModel.js';
import Event from '../models/eventModel.js';
import sendEmail from '../utils/sendEmail.js';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY)
    : null;

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

//@dec create payment intent for ticket
//@routes post /api/tickets/create-payment-intent/:id
//@access customer
export const createTicketPaymentIntent = async (req, res) => {
    const { id: eventId } = req.params;
    const ticketCount = Number(req.body.numberOfTickets);

    try {
        if (!stripe) {
            return res.status(500).json({ message: "Stripe test mode is not configured on the server" });
        }

        if (!Number.isInteger(ticketCount) || ticketCount < 1) {
            return res.status(400).json({ message: "Please select at least one ticket" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const totalPrice = event.ticketPrice * ticketCount;
        const amountInPaise = Math.round(totalPrice * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaise,
            currency: 'inr',
            payment_method_types: ['card'],
            metadata: {
                checkoutType: 'ticket',
                customerId: req.user.customerId.toString(),
                eventId: eventId,
                numberOfTickets: ticketCount.toString(),
            },
        });

        return res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            totalPrice,
        });
    } catch (error) {
        console.log("Error in createTicketPaymentIntent:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

//@dec post ticket
//@routes post /api/tickets/:id
//@access customer
export const postTicket = async (req, res) => {
    const { id: eventId } = req.params
    const customerId = req.user.customerId;

    // Destructure contact fields from req.body
    const { numberOfTickets, name, phone, email, petName, petBreed, petAge, paymentIntentId } = req.body;
    const ticketCount = Number(numberOfTickets);

    try {
        if (!stripe) {
            return res.status(500).json({ message: "Stripe test mode is not configured on the server" });
        }

        if (!Number.isInteger(ticketCount) || ticketCount < 1) {
            return res.status(400).json({ message: "Please select at least one ticket" });
        }

        if (!paymentIntentId) {
            return res.status(400).json({ message: "Payment intent ID is required" });
        }
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: "Payment not completed" });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const leftTickets = event.total_tickets - event.tickets_sold;
        if (leftTickets < ticketCount) {
            return res.status(400).json({ message: `Only ${leftTickets} tickets are left` });
        }

        // Calculate total price
        const totalPrice = event.ticketPrice * ticketCount;
        const expectedAmountInPaise = Math.round(totalPrice * 100);

        const paymentMatchesTicket = paymentIntent.metadata?.checkoutType === 'ticket'
            && paymentIntent.metadata?.customerId === customerId.toString()
            && paymentIntent.metadata?.eventId === eventId
            && paymentIntent.metadata?.numberOfTickets === ticketCount.toString()
            && paymentIntent.amount === expectedAmountInPaise
            && paymentIntent.currency === 'inr';

        if (!paymentMatchesTicket) {
            return res.status(400).json({ message: "Payment verification failed for this booking" });
        }

        const existingTicket = await Ticket.findOne({ paymentIntentId: paymentIntent.id });
        if (existingTicket) {
            return res.status(200).json({
                success: true,
                ticket: existingTicket,
                message: `Tickets booked successfully! Total: â‚¹${totalPrice}`
            });
        }
        
        const newTicket = await Ticket.create({
            eventId,
            customerId,
            numberOfTickets: ticketCount,
            price: totalPrice,
            paymentIntentId: paymentIntent.id,
            contactName: name,
            contactPhone: phone,
            contactEmail: email,
            petName: petName || '', 
            petBreed: petBreed || '',
            petAge: petAge || null,
        });

        event.tickets_sold = event.tickets_sold + ticketCount;
        await event.save();

        // --- NEW BEAUTIFUL EMAIL CODE ---
        const emailMessage = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                
                <div style="background-color: #FF8A00; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">🐾 HappyTails</h1>
                    <p style="color: #fff3e0; margin-top: 5px; font-size: 16px;">Ticket Booking Confirmation</p>
                </div>

                <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
                    <h2 style="color: #2c3e50; margin-top: 0;">You're going to ${event.title}! 🎉</h2>
                    <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
                    <p style="font-size: 16px;">We are thrilled to let you know that your ticket booking was successful. Get ready for a pawsome time!</p>
                    
                    <div style="background-color: #fff8f0; border-left: 4px solid #FF8A00; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #FF8A00; font-size: 18px;">🎟️ Booking Details</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 6px 0; color: #555;"><strong>Number of Tickets:</strong></td><td style="padding: 6px 0; text-align: right; color: #333;">${ticketCount}</td></tr>
                            <tr><td style="padding: 6px 0; color: #555;"><strong>Total Price:</strong></td><td style="padding: 6px 0; text-align: right; color: #333;">₹${totalPrice}</td></tr>
                            <tr><td style="padding: 6px 0; color: #555;"><strong>Phone Number:</strong></td><td style="padding: 6px 0; text-align: right; color: #333;">${phone}</td></tr>
                            ${petName ? `<tr><td style="padding: 6px 0; color: #555;"><strong>Pet Guest:</strong></td><td style="padding: 6px 0; text-align: right; color: #333;">${petName} (${petBreed || 'N/A'})</td></tr>` : ''}
                        </table>
                    </div>

                    <div style="background-color: #f1f8ff; border: 1px solid #cce5ff; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                        <p style="margin: 0; font-size: 15px; color: #004085;">
                            <strong>📥 Want your official ticket?</strong><br>
                            You can easily view and download your official Ticket PDF at any time by logging into your account on the HappyTails website.
                        </p>
                    </div>

                    <p style="font-size: 16px;">We look forward to seeing you there!</p>
                </div>

                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; font-size: 14px; color: #777;">With love & wags,<br><strong>The HappyTails Team</strong></p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                email: email, // Email address coming from the request body
                subject: `🎟️ HappyTails - Your Tickets for ${event.title}`,
                message: emailMessage
            });
            console.log("Confirmation email sent successfully");
        } catch (emailError) {
            console.error("Error sending confirmation email:", emailError);
            // We catch the error but don't fail the request, 
            // since the ticket was already successfully booked.
        }
        // --- END OF EMAIL CODE ---

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

