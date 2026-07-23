const crypto = require("crypto");
const bcrypt = require("bcrypt");
const ApiKey = require("../models/ApiKey.model");

// Helper function to generate a secure random string
const generateKey = () => crypto.randomBytes(32).toString("hex");

// @desc    Get all API keys for current user
// @route   GET /api/api-keys
// @access  Private
const getApiKeys = async (req, res, next) => {
  try {
    const keys = await ApiKey.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      apiKeys: keys,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new API key
// @route   POST /api/api-keys
// @access  Private
const createApiKey = async (req, res, next) => {
  try {
    const { label } = req.body;
    
    if (!label) {
      const error = new Error("Label is required");
      error.statusCode = 400;
      return next(error);
    }

    // Generate raw key
    const rawKey = `df_${generateKey()}`;
    const prefix = rawKey.substring(0, 8) + "...";
    
    // Hash key
    const salt = await bcrypt.genSalt(10);
    const hashedKey = await bcrypt.hash(rawKey, salt);

    const apiKey = await ApiKey.create({
      key: hashedKey,
      label,
      prefix,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      apiKey: {
        _id: apiKey._id,
        label: apiKey.label,
        prefix: apiKey.prefix,
        createdAt: apiKey.createdAt,
        lastUsed: apiKey.lastUsed,
      },
      rawKey, // Only shown once!
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke/Delete an API key
// @route   DELETE /api/api-keys/:id
// @access  Private
const revokeApiKey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const apiKey = await ApiKey.findOneAndDelete({ _id: id, owner: req.user._id });
    
    if (!apiKey) {
      const error = new Error("API key not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "API key revoked successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApiKeys,
  createApiKey,
  revokeApiKey,
};
