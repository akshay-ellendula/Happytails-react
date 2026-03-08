import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or your preferred email service
        auth: {
            user: process.env.EMAIL_USERNAME, // Add these to your .env file
            pass: process.env.EMAIL_PASSWORD  // Add app-specific password to .env
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;