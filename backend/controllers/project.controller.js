// backend/controllers/project.controller.js
const Project = require("../models/Project.model");
const { createProjectSchema, updateProjectSchema } = require("../validators/project.validators");
const { hasTeamPermission } = require("../utils/rbac");

const logActivity = async () => {};

// Helper to get teams a user belongs to
const getUserTeams = async (userId) => {
  return [];
};

// @desc    Get all projects for logged-in user (paginated + filtered + team)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { status, priority, label, search, page = 1, limit = 50 } = req.query;

    const teamIds = await getUserTeams(req.user._id);

    const filter = {
      $or: [
        { owner: req.user._id },
        { teamId: { $in: teamIds } },
      ],
    };

    // Apply additional filters
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
      Project.find(filter)
        .populate("teamId", "name")
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
    const teamId = req.body.teamId || null;

    if (teamId) {
      const isAllowed = await hasTeamPermission(req.user._id, teamId, "editor");
      if (!isAllowed) {
        return res.status(403).json({ success: false, message: "Unauthorized to create project in this team" });
      }
    }

    const project = await Project.create({
      ...validatedData,
      teamId,
      owner: req.user._id,
    });

    if (teamId) {
      await logActivity(teamId, req.user._id, "created project", "project", project._id, project.title);
      // Emit socket event to team
      const io = req.app.get("io");
      if (io) io.to(`team_${teamId}`).emit("project:created", project);
    }

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
    const project = await Project.findById(req.params.id)
      .populate("teamId", "name members")
      .lean();

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Auth check
    const isOwner = project.owner.toString() === req.user._id.toString();
    let hasAccess = isOwner;

    if (project.teamId) {
      hasAccess = await hasTeamPermission(req.user._id, project.teamId._id, "viewer");
    }

    if (!hasAccess) {
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

    // Permission check
    const isOwner = project.owner.toString() === req.user._id.toString();
    let isAllowed = isOwner;

    if (project.teamId) {
      isAllowed = await hasTeamPermission(req.user._id, project.teamId, "editor");
    }

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: "Unauthorized to edit this project" });
    }

    // Perform update
    Object.assign(project, validatedData);
    await project.save();

    if (project.teamId) {
      await logActivity(project.teamId, req.user._id, "updated project", "project", project._id, project.title);
      // Emit socket event
      const io = req.app.get("io");
      if (io) io.to(`team_${project.teamId}`).emit("project:updated", project);
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
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Permission check
    const isOwner = project.owner.toString() === req.user._id.toString();
    let isAllowed = isOwner;

    if (project.teamId) {
      isAllowed = await hasTeamPermission(req.user._id, project.teamId, "admin");
    }

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this project (Admin only)" });
    }

    const teamId = project.teamId;
    const title = project.title;
    
    await Project.findByIdAndDelete(req.params.id);

    if (teamId) {
      await logActivity(teamId, req.user._id, "deleted project", "project", null, title);
      // Emit socket event
      const io = req.app.get("io");
      if (io) io.to(`team_${teamId}`).emit("project:deleted", { id: req.params.id });
    }

    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, createProject, getProjectById, updateProject, deleteProject };

