// backend/controllers/env.controller.js
const EnvVariable = require("../models/EnvVariable.model");
const Project = require("../models/Project.model");
const { createEnvSchema, updateEnvSchema } = require("../validators/env.validators");

// @desc    Get all env vars for logged-in user
// @route   GET /api/env-vars
// @access  Private
const getEnvVars = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    
    // Filter by exact project (or null for global if projectId=global)
    const filter = { owner: req.user._id };
    if (projectId === "global") {
      filter.projectId = null;
    } else if (projectId) {
      filter.projectId = projectId;
    }

    const envVars = await EnvVariable.find(filter)
      .sort({ createdAt: -1 }); // Keep mongoose document to use getters for decryption

    // We MUST map over them to trigger the getter (which decrypts it), 
    // because .lean() bypasses getters. So we avoid .lean() here and use .toJSON().
    const decryptedVars = envVars.map(v => v.toJSON());

    // Also return list of user's projects for the dropdown
    const projects = await Project.find({ owner: req.user._id })
      .select("title _id")
      .sort({ title: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: decryptedVars,
      meta: { projects },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an env var
// @route   POST /api/env-vars
// @access  Private
const createEnvVar = async (req, res, next) => {
  try {
    const validatedData = createEnvSchema.parse(req.body);
    
    // Check for duplicate key
    const existing = await EnvVariable.findOne({
      owner: req.user._id,
      projectId: validatedData.projectId,
      key: validatedData.key,
    });

    if (existing) {
      const error = new Error(`Key '${validatedData.key}' already exists in this scope`);
      error.statusCode = 400;
      return next(error);
    }

    // Creating via mongoose model triggers the setter (which encrypts it)
    const envVar = await EnvVariable.create({ ...validatedData, owner: req.user._id });
    
    res.status(201).json({ success: true, data: envVar.toJSON() });
  } catch (error) {
    // Handle Mongoose duplicate key error fallback
    if (error.code === 11000) {
      const customError = new Error("Key already exists in this scope");
      customError.statusCode = 400;
      return next(customError);
    }
    next(error);
  }
};

// @desc    Update an env var
// @route   PUT /api/env-vars/:id
// @access  Private
const updateEnvVar = async (req, res, next) => {
  try {
    const validatedData = updateEnvSchema.parse(req.body);

    const envVar = await EnvVariable.findOne({ _id: req.params.id, owner: req.user._id });
    if (!envVar) {
      const error = new Error("Environment variable not found");
      error.statusCode = 404;
      return next(error);
    }

    if (validatedData.key) envVar.key = validatedData.key;
    if (validatedData.value !== undefined) envVar.value = validatedData.value; // Triggers setter

    await envVar.save();

    res.status(200).json({ success: true, data: envVar.toJSON() });
  } catch (error) {
    if (error.code === 11000) {
      const customError = new Error("Key already exists in this scope");
      customError.statusCode = 400;
      return next(customError);
    }
    next(error);
  }
};

// @desc    Delete an env var
// @route   DELETE /api/env-vars/:id
// @access  Private
const deleteEnvVar = async (req, res, next) => {
  try {
    const envVar = await EnvVariable.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!envVar) {
      const error = new Error("Environment variable not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, message: "Variable deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEnvVars,
  createEnvVar,
  updateEnvVar,
  deleteEnvVar,
};
