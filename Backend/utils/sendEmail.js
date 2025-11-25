const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, text) => {
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
