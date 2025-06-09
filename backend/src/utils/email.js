// utils/email.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, verificationLink) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Email Verification - HospMan",
    html: `<h2>Welcome to HospMan!</h2>
           <p>Click the link below to verify your email:</p>
           <a href="${verificationLink}">Verify Email</a>`,
  };
  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Welcome to HospMan!",
    html: `<h2>Hello ${name},</h2>
           <p>Thanks for registering on HospMan. We're excited to have you on board!</p>
           <p>We'll take care of your healthcare journey 😇</p>`,
  };
  await transporter.sendMail(mailOptions);
};
