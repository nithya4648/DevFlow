const { Resend } = require("resend");
const logger = require("./logger");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  logger.info({ to, subject }, "Email sending triggered");
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "DevFlow <onboarding@resend.dev>",
      to,
      subject,
      html,
      text,
    });
    logger.info({ to, data }, "Email sent successfully via Resend");
    return data;
  } catch (error) {
    logger.error({ err: error, to, subject }, "Failed to send email via Resend");
    throw error;
  }
};

const sendVerificationEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || "https://dev-flow-zeta-ashy.vercel.app";
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
  const clientUrl = process.env.CLIENT_URL || "https://dev-flow-zeta-ashy.vercel.app";
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
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
