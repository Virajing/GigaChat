const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, text) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('---------------------------------------------------');
        console.log('WARNING: Email credentials not found in .env');
        console.log(`Would have sent email to: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${text}`);
        console.log('---------------------------------------------------');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can use other services
            auth: {
                user: process.env.EMAIL_USER, // Your email
                pass: process.env.EMAIL_PASS, // Your email password or app password
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: text,
        });

        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error to prevent crashing the registration process if email fails
        // But in production you might want to handle this differently
    }
};

module.exports = sendEmail;
