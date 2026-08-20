// backend/controllers/doc.controller.js
const Doc = require("../models/Doc.model");
const DocVersion = require("../models/DocVersion.model");
const { createDocSchema, updateDocSchema } = require("../validators/doc.validators");
const { hasTeamPermission } = require("../utils/rbac");

const Activity = require("../models/Activity.model");
const logActivity = async (teamId, userId, action, targetType, targetId, targetName) => {
  await Activity.create({ team: teamId || null, user: userId, action, targetType, targetId, targetName });
};

// Helper to get teams a user belongs to
const getUserTeams = async (userId) => {
  return [];
};

// @desc    Get all docs for logged-in user
// @route   GET /api/docs
// @access  Private
const getDocs = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const teamIds = await getUserTeams(req.user._id);

    const filter = {
      $or: [
        { owner: req.user._id },
        { teamId: { $in: teamIds } },
      ],
    };

    if (category) filter.category = category;
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const [docs, categories] = await Promise.all([
      Doc.find(filter)
        .select("title category teamId updatedAt createdAt") // exclude content for list view
        .populate("teamId", "name")
        .sort({ updatedAt: -1 })
        .lean(),
      Doc.distinct("category", {
        $or: [
          { owner: req.user._id },
          { teamId: { $in: teamIds } }
        ]
      }),
    ]);

    res.status(200).json({
      success: true,
      data: docs,
      meta: { categories: categories.filter(Boolean).sort() },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a doc
// @route   POST /api/docs
// @access  Private
const createDoc = async (req, res, next) => {
  try {
    const validatedData = createDocSchema.parse(req.body);
    const teamId = req.body.teamId || null;

    if (teamId) {
      const isAllowed = await hasTeamPermission(req.user._id, teamId, "editor");
      if (!isAllowed) {
        return res.status(403).json({ success: false, message: "Unauthorized to create doc in this team" });
      }
    }

    const doc = await Doc.create({
      ...validatedData,
      teamId,
      owner: req.user._id,
    });

    await logActivity(teamId, req.user._id, "created document", "doc", doc._id, doc.title);
    if (teamId) {
      // Emit socket event
      const io = req.app.get("io");
      if (io) io.to(`team_${teamId}`).emit("doc:created", doc);
    }

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single doc by ID (full content)
// @route   GET /api/docs/:id
// @access  Private
const getDocById = async (req, res, next) => {
  try {
    const doc = await Doc.findById(req.params.id)
      .populate("teamId", "name members")
      .lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const isOwner = doc.owner.toString() === req.user._id.toString();
    let hasAccess = isOwner;

    if (doc.teamId) {
      hasAccess = await hasTeamPermission(req.user._id, doc.teamId._id, "viewer");
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Unauthorized to view this document" });
    }

    res.status(200).json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a doc (also saves a version snapshot)
// @route   PUT /api/docs/:id
// @access  Private
const updateDoc = async (req, res, next) => {
  try {
    const validatedData = updateDocSchema.parse(req.body);

    const existing = await Doc.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const isOwner = existing.owner.toString() === req.user._id.toString();
    let isAllowed = isOwner;

    if (existing.teamId) {
      isAllowed = await hasTeamPermission(req.user._id, existing.teamId, "editor");
    }

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: "Unauthorized to edit this document" });
    }

    // Save version snapshot of the PREVIOUS state
    await DocVersion.create({
      docId: existing._id,
      title: existing.title,
      content: existing.content,
      editedAt: existing.updatedAt,
    });

    // Update
    Object.assign(existing, validatedData);
    await existing.save();

    await logActivity(existing.teamId, req.user._id, "updated document", "doc", existing._id, existing.title);
    if (existing.teamId) {
      // Emit socket event
      const io = req.app.get("io");
      if (io) io.to(`team_${existing.teamId}`).emit("doc:updated", existing);
    }

    res.status(200).json({ success: true, data: existing });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a doc (also deletes all its versions)
// @route   DELETE /api/docs/:id
// @access  Private
const deleteDoc = async (req, res, next) => {
  try {
    const doc = await Doc.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const isOwner = doc.owner.toString() === req.user._id.toString();
    let isAllowed = isOwner;

    if (doc.teamId) {
      isAllowed = await hasTeamPermission(req.user._id, doc.teamId, "admin");
    }

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this document (Admin only)" });
    }

    const teamId = doc.teamId;
    const title = doc.title;

    await Doc.findByIdAndDelete(req.params.id);
    await DocVersion.deleteMany({ docId: doc._id });

    await logActivity(teamId, req.user._id, "deleted document", "doc", null, title);
    if (teamId) {
      // Emit socket event
      const io = req.app.get("io");
      if (io) io.to(`team_${teamId}`).emit("doc:deleted", { id: req.params.id });
    }

    res.status(200).json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get version history for a doc
// @route   GET /api/docs/:id/versions
// @access  Private
const getDocVersions = async (req, res, next) => {
  try {
    const doc = await Doc.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const isOwner = doc.owner.toString() === req.user._id.toString();
    let hasAccess = isOwner;

    if (doc.teamId) {
      hasAccess = await hasTeamPermission(req.user._id, doc.teamId, "viewer");
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const versions = await DocVersion.find({ docId: req.params.id })
      .select("title editedAt _id")
      .sort({ editedAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: versions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific version (full content)
// @route   GET /api/docs/:id/versions/:versionId
// @access  Private
const getDocVersionById = async (req, res, next) => {
  try {
    const doc = await Doc.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const isOwner = doc.owner.toString() === req.user._id.toString();
    let hasAccess = isOwner;

    if (doc.teamId) {
      hasAccess = await hasTeamPermission(req.user._id, doc.teamId, "viewer");
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const version = await DocVersion.findOne({
      _id: req.params.versionId,
      docId: req.params.id,
    }).lean();

    if (!version) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }

    res.status(200).json({ success: true, data: version });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocs,
  createDoc,
  getDocById,
  updateDoc,
  deleteDoc,
  getDocVersions,
  getDocVersionById,
};

