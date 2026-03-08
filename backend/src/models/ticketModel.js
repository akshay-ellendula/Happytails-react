import mongoose from 'mongoose';

// This helps to generate a ticket ID automatically when ticket created
function generateTicketId() {
    const now = Date.now(); // current time in ms
    const random = Math.floor(100 + Math.random() * 900); // random 3-digit number
    const num = String(now).slice(-5) + random; // last 5 digits of time + random
    return `TKT-${num}`;
}

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true,
        default: generateTicketId,
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    // --- NEW FIELDS TO STORE BILLING DETAILS ---
    contactName: {
        type: String,
        required: true
    },
    contactPhone: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String,
        required: true
    },
    // -------------------------------------------
    numberOfTickets: {
        type: Number,
        required: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
        required: true
    },
    petName: {
        type: String,
    },
    petBreed: {
        type: String,
    },
    petAge: {
        type: Number,
    },
}, {
    timestamps: true,
})

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;