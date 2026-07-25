const User = require("../models/User.model");
const logger = require("../utils/logger");
const bcrypt = require("bcrypt");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");


// @desc    Update user profile (name, avatar)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    if (name) {
      user.name = name;
    }

    if (req.file) {
      if (isCloudinaryConfigured()) {
        logger.info("Uploading avatar file to Cloudinary");
        const uploadPromise = new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "devflow_avatars", resource_type: "image" },
            (error, result) => {
              if (error) {
                logger.error({ err: error }, "Cloudinary upload failed");
                reject(error);
              } else {
                logger.info({ secureUrl: result.secure_url }, "Cloudinary upload successful");
                resolve(result);
              }
            }
          );
          stream.end(req.file.buffer);
        });

        const result = await uploadPromise;
        user.avatar = result.secure_url;
      } else {
        logger.info("Cloudinary credentials not provided in .env — using Data URI fallback for avatar");
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        user.avatar = base64Image;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    // Check if user uses google auth
    if (!user.password && user.googleId) {
      const error = new Error("You are logged in via Google. You cannot change your password here.");
      error.statusCode = 400;
      return next(error);
    }

    // Compare passwords
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error("Incorrect current password");
      error.statusCode = 401;
      return next(error);
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update preferences
// @route   PUT /api/users/preferences
// @access  Private
const updatePreferences = async (req, res, next) => {
  try {
    const { theme, defaultLandingPage } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    if (theme) {
      user.preferences.theme = theme;
    }
    
    if (defaultLandingPage) {
      user.preferences.defaultLandingPage = defaultLandingPage;
    }

    await user.save();

    res.status(200).json({
      success: true,
      preferences: user.preferences,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current session info
// @route   GET /api/users/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    // Since we use JWTs in cookies, we don't have DB sessions.
    // We just return the current inferred session info.
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    
    res.status(200).json({
      success: true,
      sessions: [
        {
          id: "current",
          ip,
          userAgent,
          lastActive: new Date(),
          isCurrent: true,
        }
      ]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke session
// @route   DELETE /api/users/sessions/:id
// @access  Private
const revokeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (id === "current") {
      res.clearCookie("devflow_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return res.status(200).json({ success: true, message: "Current session revoked" });
    }
    
    res.status(400).json({ success: false, message: "Only current session revocation supported with JWT" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  updatePassword,
  updatePreferences,
  getSessions,
  revokeSession,
};
