import nodemailer from 'nodemailer';

export const isMailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

let transporter = null;
const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
    }
    return transporter;
};

/** Sends an email through the configured Gmail account. Throws if sending fails. */
export const sendMail = ({ to, subject, html }) =>
    getTransporter().sendMail({ from: process.env.EMAIL_USER, to, subject: subject.replace(/[\r\n]/g, ' '), html });
