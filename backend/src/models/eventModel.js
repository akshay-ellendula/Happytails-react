import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    eventManagerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EventManager'
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    ageLimtit : {
        type : Number,
        required : true
    },
    ticketPrice: {
        type: Number,
        required: true
    },
    date_time: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Upcoming'
    },
    total_tickets: {
        type: Number,
        required: true,
    },
    tickets_sold: {
        type: Number,
        default: 0
    },
    posterUrl_1: {
        type: String,
        required: true
    },
    posterUrl_2: {
        type: String,
    },
    category: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        required: true,
    },
    instructions: {
        type: String,
        required: true
    },
    location : {
        type : String,
        required : true
    },
    venue : {
        type : String,
        required : true
    },
    terms : {
        type : String,
        required : true
    }
}, {
    timestamps: true
})

const Event = mongoose.model("Event", eventSchema);
export default Event;