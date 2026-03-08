import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    eventManagerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EventManager',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    // Event Details
    language: {
        type: String,
        required: true,
        default: 'English'
    },
    duration: {
        type: String,
        required: true
    },
    ageLimit: {
        type: String,
        required: true
    },
    // Pricing - Only one price field needed
    ticketPrice: {
        type: Number,
        required: true
    },
    // Date & Time
    date_time: {
        type: Date,
        required: true,
    },
    // Multiple Image Sizes
    images: {
        thumbnail: {
            type: String,
            required: true
        },
        banner: {
            type: String,
            required: true
        }
    },
    // Category & Type
    category: {
        type: String,
        required: true
    },
    // Location
    venue: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    // Tickets
    total_tickets: {
        type: Number,
        required: true,
    },
    tickets_sold: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Event = mongoose.model("Event", eventSchema);
export default Event;