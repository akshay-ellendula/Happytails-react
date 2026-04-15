import cron from 'node-cron';
import crypto from 'crypto';
import Event from '../models/eventModel.js';
import Ticket from '../models/ticketModel.js';
import sendEmail from './sendEmail.js';

// 1. Extract the logic into a reusable function
const sendReviewEmails = async () => {
    try {
        console.log('Running check for completed events...');
        
        // FOR TESTING: We removed the "$gte: yesterday" part so it finds ALL past events
        const completedEvents = await Event.find({
            date_time: { $lt: new Date() } 
        });

        console.log(`Found ${completedEvents.length} past events to process.`);

        for (const event of completedEvents) {
            // Find all valid, un-reviewed tickets for this event
            const tickets = await Ticket.find({
                eventId: event._id,
                status: true,
                isReviewed: false
            }).populate('customerId');

            console.log(`Found ${tickets.length} un-reviewed tickets for event: ${event.title}`);

            for (const ticket of tickets) {
                // 1. Generate a raw random token
                const resetToken = crypto.randomBytes(32).toString('hex');

                // 2. Hash it to store in DB
                const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

                // 3. Save to ticket (Expires in 7 days)
                ticket.reviewToken = hashedToken;
                ticket.reviewTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;
                await ticket.save();

                // 4. Use the Environment Variable for the Frontend URL
                const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                const reviewUrl = `${baseUrl}/review/${ticket._id}/${resetToken}`;

                // 5. Send Email
                const message = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
    </style>

    <div style="font-family: 'DM Sans', 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #000000;">

        <div style="background-color: #FFD700; padding: 36px 30px; text-align: center; border-bottom: 3px solid #000000;">
            <h1 style="color: #000000; margin: 0; font-size: 38px; font-family: 'Playfair Display', Georgia, serif; font-weight: 900; letter-spacing: 2px;">🐾 HappyTails</h1>
            <div style="width: 60px; height: 3px; background-color: #000000; margin: 12px auto;"></div>
            <p style="color: #000000; margin: 0; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; font-family: 'DM Sans', sans-serif; font-weight: 600;">We'd Love Your Feedback</p>
        </div>

        <div style="background-color: #000000; padding: 32px 36px; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 5px; text-transform: uppercase; color: #FFD700; font-family: 'DM Sans', sans-serif; font-weight: 600;">You Attended</p>
            <h2 style="margin: 0; font-size: 28px; color: #ffffff; font-family: 'Playfair Display', Georgia, serif; font-weight: 700; line-height: 1.3;">${event.title}</h2>
            <div style="width: 40px; height: 3px; background-color: #FFD700; margin: 16px auto 0;"></div>
        </div>

        <div style="padding: 40px 36px; background-color: #ffffff;">

            <p style="font-size: 16px; color: #222222; font-family: 'DM Sans', sans-serif; margin-top: 0;">
                Hi <strong>${ticket.contactName}</strong> 👋
            </p>
            <p style="font-size: 15px; color: #444444; font-family: 'DM Sans', sans-serif; line-height: 1.75;">
                We hope you and your furry friend had an absolutely <strong>pawsome</strong> time at <strong>${event.title}</strong>! 
                Your experience means the world to us — and to future pet parents looking for their next adventure.
            </p>
            <p style="font-size: 15px; color: #444444; font-family: 'DM Sans', sans-serif; line-height: 1.75;">
                Could you spare 2 minutes to share how it went? 🌟
            </p>

            <div style="background-color: #000000; padding: 24px 28px; margin: 28px 0; text-align: center;">
                <p style="margin: 0 0 6px; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #888888; font-family: 'DM Sans', sans-serif;">Rate Your Experience</p>
                <p style="margin: 0; font-size: 36px; letter-spacing: 6px;">⭐⭐⭐⭐⭐</p>
                <p style="margin: 8px 0 0; font-size: 13px; color: #555555; font-family: 'DM Sans', sans-serif;">Click the button below to leave your full review</p>
            </div>

            <div style="border: 2px solid #000000; background-color: #FFFBEA; padding: 16px 20px; margin-bottom: 32px;">
                <p style="margin: 0; font-size: 13px; color: #333333; font-family: 'DM Sans', sans-serif;">
                    ⏳ <strong>This link is unique to you</strong> and will expire in <strong>7 days</strong>. Please don't share it with anyone.
                </p>
            </div>

            <div style="text-align: center; margin: 32px 0 20px;">
                <a href="${reviewUrl}"
                   style="background-color: #FFD700; color: #000000; padding: 16px 40px; text-decoration: none; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; display: inline-block; border: 2px solid #000000;">
                    Leave a Review →
                </a>
            </div>

            <p style="font-size: 13px; color: #999999; font-family: 'DM Sans', sans-serif; text-align: center; margin-top: 20px;">
                Or copy this link into your browser:<br>
                <span style="color: #555555; word-break: break-all;">${reviewUrl}</span>
            </p>

        </div>

        <div style="background-color: #000000; padding: 26px 30px; text-align: center; border-top: 3px solid #FFD700;">
            <p style="margin: 0; font-size: 11px; color: #FFD700; letter-spacing: 4px; text-transform: uppercase; font-family: 'DM Sans', sans-serif;">With love & wags</p>
            <p style="margin: 8px 0 0; font-size: 20px; color: #ffffff; font-family: 'Playfair Display', Georgia, serif; font-weight: 700;">The HappyTails Team 🐾</p>
        </div>

    </div>
`;

                await sendEmail({
                    email: ticket.contactEmail,
                    subject: `How was ${event.title}? Leave a review!`,
                    message: message
                });
                console.log(`Successfully sent email to ${ticket.contactEmail}`);
            }
        }
        console.log('Finished processing review emails.');
    } catch (error) {
        console.error("Error in review email cron job:", error);
    }
};

if (process.env.NODE_ENV !== 'test') {
    // 2. UNCOMMENT THE LINE BELOW TO TEST IMMEDIATELY ON SERVER START
    // sendReviewEmails(); 

    // 3. This remains your daily 10:00 AM production schedule
    cron.schedule('0 10 * * *', () => {
        // When you are done testing, you must put the yesterday logic back in here
        // so it doesn't email people about events from 3 months ago!
        sendReviewEmails(); 
    });
}