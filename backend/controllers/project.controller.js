// backend/controllers/project.controller.js
const Project = require("../models/Project.model");
const Activity = require("../models/Activity.model");
const { createProjectSchema, updateProjectSchema } = require("../validators/project.validators");
const { escapeRegex } = require("../utils/regex.utils");

const logActivity = async (userId, action, targetType, targetId, targetName) => {
  try {
    await Activity.create({ user: userId, action, targetType, targetId, targetName });
  } catch {
    // Activity logging shouldn't crash the main operation
  }
};

// @desc    Get all projects for logged-in user (paginated + filtered)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { status, priority, label, search, page = 1, limit = 50 } = req.query;

    const filter = { owner: req.user._id };

    // Apply additional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (label) filter.labels = { $in: [label] };
    if (search) {
      const searchRegex = { $regex: escapeRegex(search), $options: "i" };
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
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

    await logActivity(req.user._id, "created project", "project", project._id, project.title);

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
    const project = await Project.findById(req.params.id).lean();

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized to view this project" });
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

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized to edit this project" });
    }

    Object.assign(project, validatedData);
    await project.save();

    await logActivity(req.user._id, "updated project", "project", project._id, project.title);

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
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this project" });
    }

    const title = project.title;
    await Project.findByIdAndDelete(req.params.id);

    await logActivity(req.user._id, "deleted project", "project", null, title);

    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, createProject, getProjectById, updateProject, deleteProject };
