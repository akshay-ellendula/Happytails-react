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

        const emailMessage = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
    </style>

    <div style="font-family: 'DM Sans', 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #000000;">

        <!-- Header -->
        <div style="background-color: #FFD700; padding: 36px 30px; text-align: center; border-bottom: 3px solid #000000;">
            <h1 style="color: #000000; margin: 0; font-size: 38px; font-family: 'Playfair Display', Georgia, serif; font-weight: 900; letter-spacing: 2px;">🐾 HappyTails</h1>
            <div style="width: 60px; height: 3px; background-color: #000000; margin: 12px auto;"></div>
            <p style="color: #000000; margin: 0; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif; font-weight: 600;">Ticket Booking Confirmation</p>
        </div>

        <!-- Body -->
        <div style="padding: 44px 36px; color: #111111; line-height: 1.75; background-color: #ffffff;">

            <h2 style="color: #000000; margin-top: 0; font-size: 24px; font-family: 'Playfair Display', Georgia, serif; font-weight: 700; border-bottom: 2px solid #FFD700; padding-bottom: 12px;">
                You're going to ${event.title}! 🎉
            </h2>

            <p style="font-size: 16px; color: #222222; font-family: 'DM Sans', sans-serif;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 15px; color: #444444; font-family: 'DM Sans', sans-serif;">
                Your ticket booking is confirmed. Get ready for a <strong>pawsome</strong> time — we can't wait to see you there!
            </p>

            <!-- Booking Details Card -->
            <div style="background-color: #000000; padding: 28px; margin: 28px 0;">
                <h3 style="margin-top: 0; color: #FFD700; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif; font-weight: 600;">🎟️ Booking Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #2a2a2a;">
                        <td style="padding: 11px 0; color: #888888; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">Number of Tickets</td>
                        <td style="padding: 11px 0; text-align: right; color: #FFD700; font-size: 20px; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">${ticketCount}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #2a2a2a;">
                        <td style="padding: 11px 0; color: #888888; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">Total Amount</td>
                        <td style="padding: 11px 0; text-align: right; color: #FFD700; font-size: 20px; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">₹${totalPrice}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #2a2a2a;">
                        <td style="padding: 11px 0; color: #888888; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">Contact Phone</td>
                        <td style="padding: 11px 0; text-align: right; color: #ffffff; font-size: 15px; font-family: 'DM Sans', sans-serif;">${phone}</td>
                    </tr>
                    ${petName ? `
                    <tr>
                        <td style="padding: 11px 0; color: #888888; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">Pet Guest</td>
                        <td style="padding: 11px 0; text-align: right; color: #ffffff; font-size: 15px; font-family: 'DM Sans', sans-serif;">${petName} (${petBreed || 'N/A'})</td>
                    </tr>` : ''}
                </table>
            </div>

            <!-- Download Notice -->
            <div style="border: 2px solid #000000; background-color: #FFFBEA; padding: 20px 22px; margin-bottom: 28px;">
                <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #000000; font-family: 'DM Sans', sans-serif;">📥 Your Official Ticket</p>
                <p style="margin: 0; font-size: 14px; color: #444444; font-family: 'DM Sans', sans-serif;">
                    Log into your <strong>HappyTails</strong> account to view and download your official Ticket PDF at any time.
                </p>
            </div>

            <p style="font-size: 15px; color: #444444; font-family: 'DM Sans', sans-serif;">
                See you at the event — it's going to be a <strong>tail-wagging</strong> good time! 🐶
            </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #000000; padding: 26px 30px; text-align: center; border-top: 3px solid #FFD700;">
            <p style="margin: 0; font-size: 11px; color: #FFD700; letter-spacing: 4px; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">With love & wags</p>
            <p style="margin: 8px 0 0; font-size: 20px; color: #ffffff; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">The HappyTails Team 🐾</p>
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
        if (!tickets || tickets.length === 0) { // Fixed: spelling correction and proper check
            return res.status(404).json({ message: "No tickets found for this user" }) // Fixed: Added return
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

