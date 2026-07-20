// backend/controllers/project.controller.js
const Project = require("../models/Project.model");
const { createProjectSchema, updateProjectSchema } = require("../validators/project.validators");

// @desc    Get all projects for logged-in user (paginated + filtered)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { status, priority, label, search, page = 1, limit = 50 } = req.query;

    const filter = { owner: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (label) filter.labels = { $in: [label] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Project.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);

    const project = await Project.create({
      ...validatedData,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).lean();

    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const validatedData = updateProjectSchema.parse(req.body);

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: validatedData },
      { new: true, runValidators: true }
    ).lean();

    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, createProject, getProjectById, updateProject, deleteProject };
