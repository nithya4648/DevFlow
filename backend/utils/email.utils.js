const nodemailer = require("nodemailer");

// Create nodemailer transporter
const getTransporter = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
    console.log(`📧 [TRANSPORTER USED: Gmail] Configured Nodemailer SMTP transporter using user: ${user}`);
    return nodemailer.createTransport({
      service: "Gmail",
      auth: { user, pass },
    });
  } else {
    console.log("ℹ️ [TRANSPORTER USED: Ethereal Fallback] EMAIL_USER/EMAIL_PASS not set. Attempting Ethereal test account fallback...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log(`🧪 [TRANSPORTER USED: Ethereal] Created Ethereal test email account: ${testAccount.user}`);
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn("⚠️ Could not create Ethereal email test account:", err.message);
      return null;
    }
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  console.log(`📧 [EMAIL TRIGGERED] Subject: "${subject}" | To: ${to}`);
  const transporter = await getTransporter();
  
  if (!transporter) {
    console.warn("⚠️ No email transporter available. Printing email contents to console:");
    console.log("==================================================");
    console.log(`✉️ EMAIL TO: ${to}`);
    console.log(`✉️ SUBJECT: ${subject}`);
    console.log(`✉️ TEXT CONTENT:\n${text}`);
    console.log("==================================================");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER ? `"DevFlow Support" <${process.env.EMAIL_USER}>` : '"DevFlow Support" <support@devflow.com>',
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`✉️ Email sent successfully via Ethereal. Preview URL: ${previewUrl}`);
    } else {
      console.log(`✉️ Email sent successfully to ${to} via Gmail (Message ID: ${info.messageId})`);
    }
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    if (error.code) console.error(`❌ Error Code: ${error.code}`);
    if (error.command) console.error(`❌ SMTP Command: ${error.command}`);
    console.error(`❌ Stack Trace:\n${error.stack}`);
    console.log("==================================================");
    console.log(`✉️ (FALLBACK CONSOLE LOG) EMAIL TO: ${to}`);
    console.log(`✉️ SUBJECT: ${subject}`);
    console.log(`✉️ TEXT CONTENT:\n${text}`);
    console.log("==================================================");
    throw error;
  }
};

const sendVerificationEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verificationLink = `${clientUrl}/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your DevFlow account",
    text: `Welcome to DevFlow! Please verify your email by visiting this link: ${verificationLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">Welcome to DevFlow</h2>
        <p>Hi there,</p>
        <p>Thank you for signing up! Please verify your email address to get started and unlock all features of the DevFlow platform.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${verificationLink}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">If you didn't create a DevFlow account, please ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetLink = `${clientUrl}/reset-password/${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your DevFlow password",
    text: `You requested a password reset. Please click this link to reset it: ${resetLink}. This link is valid for 1 hour.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">Reset Your Password</h2>
        <p>Hi there,</p>
        <p>We received a request to reset the password for your DevFlow account. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>This password reset link is valid for 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${resetLink}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">If you didn't make this request, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
