const crypto = require("crypto");
const User = require("../models/User.model");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../validators/auth.validators");
const {
  generateAccessToken,
  setTokenCookie,
  clearTokenCookie,
} = require("../utils/jwt.utils");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/email.utils");
const logger = require("../utils/logger");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    // 1. Validate inputs
    const validatedData = registerSchema.parse(req.body);

    const { name, email, password } = validatedData;

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("Email is already registered");
      error.statusCode = 400;
      return next(error);
    }

    // 3. Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Generate avatar using gravatar style template or initials
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`;

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password,
      avatar,
      verificationToken,
      verificationTokenExpiry,
      isVerified: false,
    });

    // --- CREATE AND EMIT WELCOME NOTIFICATION ---
    const Notification = require("../models/Notification.model");
    const { emitNotificationToUser } = require("../utils/socketService");
    
    const welcomeNote = await Notification.create({
      recipient: user._id,
      type: "success",
      message: `Welcome to DevFlow, ${user.name}! 🚀 Explore your new developer dashboard.`,
    });
    
    emitNotificationToUser(req, user._id, welcomeNote);
    // ---------------------------------------------

    // 5. Send verification email
    logger.info({ email: user.email }, "Sending verification email");
    sendVerificationEmail(user.email, verificationToken).catch((err) =>
      logger.error({ err, email: user.email }, "Async verification email failed")
    );

    res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    // 1. Validate inputs
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }

    // 3. Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      return next(error);
    }

    // Check if verified
    if (!user.isVerified) {
      const error = new Error("Account not verified. Please check your email.");
      error.statusCode = 403;
      error.isVerified = false; // Send this flag to frontend so it can show the resend button
      return next(error);
    }

    // 4. Generate token and set cookie
    const token = generateAccessToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
      token, // Return token as well for API interceptor fallback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    // 1. Validate inputs
    const validatedData = forgotPasswordSchema.parse(req.body);
    const { email } = validatedData;

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 to prevent user enumeration, but log for local debugging
      logger.info({ email }, "Password reset requested for non-existent email");
      return res.status(200).json({
        success: true,
        message: "If a user with that email exists, a password reset link has been sent.",
      });
    }

    // 3. Generate password reset token
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 4. Save token to DB
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
    await user.save();

    // 5. Send password reset email (async)
    sendPasswordResetEmail(user.email, resetPasswordToken).catch((err) =>
      logger.error({ err, email: user.email }, "Password reset email failed")
    );

    res.status(200).json({
      success: true,
      message: "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;

    // 1. Validate password inputs
    const validatedData = resetPasswordSchema.parse(req.body);
    const { password } = validatedData;

    // 2. Find user by valid token and non-expired token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      const error = new Error("Invalid or expired password reset token");
      error.statusCode = 400;
      return next(error);
    }

    // 3. Update password and clear reset token details
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Find user by valid token and non-expired token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      const error = new Error("Invalid or expired verification token");
      error.statusCode = 400;
      return next(error);
    }

    // Mark as verified, clear verification token details
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || "https://dev-flow-zeta-ashy.vercel.app"}/login?error=AuthenticationFailed`);
    }

    const token = generateAccessToken(user._id);
    setTokenCookie(res, token);

    res.redirect(`${(process.env.CLIENT_URL || "https://dev-flow-zeta-ashy.vercel.app")}/dashboard`);
  } catch (error) {
    res.redirect(`${(process.env.CLIENT_URL || "https://dev-flow-zeta-ashy.vercel.app")}/login?error=AuthenticationFailed`);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak existence
      return res.status(200).json({ success: true, message: "Verification email sent if account exists" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified" });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    // Send email
    sendVerificationEmail(user.email, verificationToken).catch((err) =>
      logger.error({ err, email: user.email }, "Resend verification email failed")
    );

    res.status(200).json({
      success: true,
      message: "Verification email resent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleCallback,
  resendVerification,
};
