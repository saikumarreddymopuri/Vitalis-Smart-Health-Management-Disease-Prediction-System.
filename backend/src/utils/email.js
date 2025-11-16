// utils/email.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, name, verificationLink) => {
  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: "Verify Your Email – VITALIS Account Activation",
    html: `
    <div style="background:#0f172a;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
      <table align="center" width="100%" style="max-width:600px;background:#1e293b;border-radius:12px;padding:30px;border:1px solid rgba(168,85,247,0.3);box-shadow:0 0 25px rgba(168,85,247,0.3);">
        
        <tr>
          <td align="center">
            <img src="https://res.cloudinary.com/dk9b9pida/image/upload/v1763272181/Screenshot_2025-11-16_111647_jybiuh.png"
                 alt="VITALIS Logo"
                 width="90"
                 style="margin-bottom:20px;border-radius:12px;" />
          </td>
        </tr>

        <tr>
          <td style="color:#a855f7;font-size:28px;font-weight:bold;text-align:center;">
            Verify Your Email
          </td>
        </tr>

        <tr>
          <td style="color:#e2e8f0;font-size:16px;text-align:center;padding:10px 0;">
            Hi <strong style="color:#38bdf8;">${name}</strong>,<br/>
            You're just one step away from activating your VITALIS account 🚀  
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:25px 0;">
            <a href="${verificationLink}"
               style="background:#38bdf8;color:#0f172a;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:bold;box-shadow:0 0 20px rgba(56,189,248,0.8);display:inline-block;">
              Verify Email
            </a>
          </td>
        </tr>

        <tr>
          <td style="color:#94a3b8;font-size:14px;text-align:center;padding:0 20px;">
            If the button doesn’t work, copy and paste this link in your browser:<br/><br/>
            <span style="color:#38bdf8;font-size:13px;">${verificationLink}</span>
          </td>
        </tr>

        <tr>
          <td style="padding:25px;color:#cbd5e1;font-size:14px;line-height:1.7;text-align:center;">
            This verification keeps your account secure.<br/><br/>
            <strong style="color:#a855f7;">— Team VITALIS 💙</strong>
          </td>
        </tr>
      </table>

      <p style="text-align:center;color:#64748b;font-size:12px;margin-top:20px;">
        © 2025 VITALIS — Smart Health Management System
      </p>
    </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};


export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: "Welcome to VITALIS 💙 Your Smart Health Companion",
    html: `
    <div style="background:#0f172a;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
      <table align="center" width="100%" style="max-width:600px;background:#1e293b;border-radius:12px;padding:30px;border:1px solid rgba(56,189,248,0.3);box-shadow:0 0 25px rgba(56,189,248,0.3);">
        
        <tr>
          <td align="center">
            <img src="https://res.cloudinary.com/dk9b9pida/image/upload/v1763272181/Screenshot_2025-11-16_111647_jybiuh.png"
                 alt="VITALIS Logo"
                 width="90"
                 style="margin-bottom:20px;border-radius:12px;" />
          </td>
        </tr>

        <tr>
          <td style="color:#38bdf8;font-size:28px;font-weight:bold;text-align:center;">
            Welcome to VITALIS!
          </td>
        </tr>

        <tr>
          <td style="color:#e2e8f0;font-size:16px;text-align:center;padding:10px 0;">
            Hello <strong style="color:#38bdf8;">${name}</strong>,<br/>
            We're excited to have you on board 🎉  
          </td>
        </tr>

        <tr>
          <td style="padding:20px;color:#cbd5e1;font-size:15px;line-height:1.7;">
            VITALIS brings a futuristic, AI-powered healthcare experience:
            <ul style="color:#94a3b8;text-align:left;padding-left:20px;line-height:1.8;">
              <li>🔹 Smart symptom-based disease prediction</li>
              <li>🔹 Real-time hospital & bed availability</li>
              <li>🔹 Instant ambulance booking</li>
              <li>🔹 Personalized dashboards for Users, Operators & Admins</li>
              <li>🔹 Secure login with Google or Email</li>
            </ul>

            <br/>
            Stay healthy. Stay informed. Stay protected.
            <br/><br/>
            <strong style="color:#a855f7;">— Team VITALIS 💙</strong>
          </td>
        </tr>
      </table>

      <p style="text-align:center;color:#64748b;font-size:12px;margin-top:20px;">
        © 2025 VITALIS — Smart Health Management System
      </p>
    </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

