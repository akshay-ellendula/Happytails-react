import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    console.log(`[EMAIL] Attempting to send to: ${options.email} | Subject: ${options.subject}`);
    console.log(`[EMAIL] Using account: ${process.env.EMAIL_USERNAME}`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Verify the SMTP connection before sending
    try {
        await transporter.verify();
        console.log('[EMAIL] SMTP connection verified ✅');
    } catch (verifyErr) {
        console.error('[EMAIL] SMTP verify FAILED ❌:', verifyErr.message);
        throw verifyErr;  // Re-throw so caller handles it
    }

    const mailOptions = {
        from: `"HappyTails 🐾" <${process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] ✅ Sent! MessageId: ${info.messageId} → ${options.email}`);
};

export default sendEmail;