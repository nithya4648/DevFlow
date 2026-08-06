const logger = require("./logger");

const checkEmailConfig = () => {
  const missing = [];
  if (!process.env.BREVO_API_KEY) {
    missing.push("BREVO_API_KEY");
  }
  if (!process.env.EMAIL_FROM) {
    missing.push("EMAIL_FROM");
  }
  if (!process.env.CLIENT_URL) {
    missing.push("CLIENT_URL");
  }

  if (missing.length > 0) {
    const isProd = process.env.NODE_ENV === "production";
    const warnMsg = `Missing email configuration environment variables: ${missing.join(", ")}. Verification emails and password resets will fail!`;

    if (isProd) {
      logger.error(`🚨 CRITICAL PRODUCTION WARNING: ${warnMsg} Please add these in your Render Dashboard environment variables.`);
      console.error(`🚨 CRITICAL PRODUCTION WARNING: ${warnMsg} Please add these in your Render Dashboard environment variables.`);
    } else {
      logger.warn(`⚠️ EMAIL CONFIG WARNING: ${warnMsg}`);
      console.warn(`⚠️ EMAIL CONFIG WARNING: ${warnMsg}`);
    }
    return { valid: false, missing };
  }

  logger.info("Email configuration environment variables verified");
  return { valid: true, missing: [] };
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === "test") {
    logger.info({ to, subject }, "Email dispatch skipped in test environment");
    return { simulated: true };
  }
  logger.info({ to, subject }, "Email sending triggered");

  if (!process.env.BREVO_API_KEY || !process.env.EMAIL_FROM) {
    logger.warn(
      { to, subject },
      "Missing BREVO_API_KEY or EMAIL_FROM configuration. Email dispatch skipped."
    );
    const err = new Error("BREVO_API_KEY and EMAIL_FROM environment variables are required");
    err.code = "MISSING_CONFIG";
    throw err;
  }

  try {
    // Extract pure email address from EMAIL_FROM (may contain a name)
    const extractEmail = (value) => {
      const match = value.match(/<([^>]+)>/);
      return match ? match[1] : value.trim();
    };
    const senderEmail = extractEmail(process.env.EMAIL_FROM);
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.message || data?.error?.message || `Brevo API returned status ${response.status}`;
      logger.error({ status: response.status, data, to, subject }, "Brevo API returned non-OK status");
      const err = new Error(errorMessage);
      err.code = "SMTP_ERROR";
      throw err;
    }

    logger.info({ to, id: data.id }, "Email sent successfully via Brevo API");
    return data;
  } catch (error) {
    if (error.code === "MISSING_CONFIG" || error.code === "SMTP_ERROR") {
      throw error;
    }
    logger.error({ err: error, to, subject }, "Failed to send email via Brevo API");
    const err = new Error(error.message || "Failed to send email via Brevo API");
    err.code = "SMTP_ERROR";
    throw err;
  }
};

const sendVerificationEmail = async (email, token) => {
  if (!process.env.CLIENT_URL) {
    const err = new Error("CLIENT_URL environment variable is required for email links");
    err.code = "MISSING_CONFIG";
    throw err;
  }
  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${token}`;

  return await sendEmail({
    to: email,
    subject: "Verify your DevFlow account",
    text: `Welcome to DevFlow! Please verify your email address by visiting this link: ${verificationLink}. This link is valid for 24 hours.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">Welcome to DevFlow</h2>
        <p>Hi there,</p>
        <p>Thank you for signing up! Please verify your email address to activate your DevFlow account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p>This verification link is valid for 24 hours.</p>
        <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #4f46e5;">${verificationLink}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">If you didn't create a DevFlow account, please ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  if (!process.env.CLIENT_URL) {
    const err = new Error("CLIENT_URL environment variable is required for email links");
    err.code = "MISSING_CONFIG";
    throw err;
  }
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

  return await sendEmail({
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
  checkEmailConfig,
};
