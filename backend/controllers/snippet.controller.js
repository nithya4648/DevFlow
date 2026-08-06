// backend/controllers/snippet.controller.js
const Snippet = require("../models/Snippet.model");
const { createSnippetSchema, updateSnippetSchema } = require("../validators/snippet.validators");
const { hasTeamPermission } = require("../utils/rbac");

const logActivity = async () => {};

// Helper to get teams a user belongs to
const getUserTeams = async (userId) => {
  return [];
};

// @desc    Get all snippets for logged-in user
// @route   GET /api/snippets
// @access  Private
const getSnippets = async (req, res, next) => {
  try {
    const { language, folder, tag, favorite, search, page = 1, limit = 100 } = req.query;

    const teamIds = await getUserTeams(req.user._id);

    const filter = {
      $or: [
        { owner: req.user._id },
        { teamId: { $in: teamIds } },
      ],
    };

    if (language) filter.language = language;
    if (folder !== undefined) filter.folder = folder;
    if (tag) filter.tags = { $in: [tag] };
    if (favorite === "true") filter.isFavorite = true;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [snippets, total] = await Promise.all([
      Snippet.find(filter)
        .populate("teamId", "name")
        .sort({ isFavorite: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Snippet.countDocuments(filter),
    ]);

    // Derive folder and tag lists from all accessible user snippets (for sidebar)
    const [allFolders, allTags] = await Promise.all([
      Snippet.distinct("folder", {
        $or: [
          { owner: req.user._id },
          { teamId: { $in: teamIds } }
        ]
      }),
      Snippet.distinct("tags", {
        $or: [
          { owner: req.user._id },
          { teamId: { $in: teamIds } }
        ]
      }),
    ]);

    res.status(200).json({
      success: true,
      data: snippets,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        folders: allFolders.filter(Boolean).sort(),
        tags: allTags.filter(Boolean).sort(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a snippet
// @route   POST /api/snippets
// @access  Private
const createSnippet = async (req, res, next) => {
  try {
    const validatedData = createSnippetSchema.parse(req.body);
    const teamId = req.body.teamId || null;

    if (teamId) {
      const isAllowed = await hasTeamPermission(req.user._id, teamId, "editor");
      if (!isAllowed) {
        return res.status(403).json({ success: false, message: "Unauthorized to create snippet in this team" });
      }
    }

    const snippet = await Snippet.create({
      ...validatedData,
      teamId,
      owner: req.user._id,
    });

    if (teamId) {
      await logActivity(teamId, req.user._id, "created snippet", "snippet", snippet._id, snippet.title);
      // Emit socket event
      const io = req.app.get("io");
      if (io) io.to(`team_${teamId}`).emit("snippet:created", snippet);
    }

    res.status(201).json({ success: true, data: snippet });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single snippet by ID
// @route   GET /api/snippets/:id
// @access  Private
const getSnippetById = async (req, res, next) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate("teamId", "name members")
      .lean();

    if (!snippet) {
      return res.status(404).json({ success: false, message: "Snippet not found" });
    }

    // Access check
    const isOwner = snippet.owner.toString() === req.user._id.toString();
    let hasAccess = isOwner;

    if (snippet.teamId) {
      hasAccess = await hasTeamPermission(req.user._id, snippet.teamId._id, "viewer");
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: "Unauthorized to view this snippet" });
    }

    res.status(200).json({ success: true, data: snippet });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a snippet
// @route   PUT /api/snippets/:id
// @access  Private
const updateSnippet = async (req, res, next) => {
  try {
    const validatedData = updateSnippetSchema.parse(req.body);

    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ success: false, message: "Snippet not found" });
    }

    // Permission check
    const isOwner = snippet.owner.toString() === req.user._id.toString();
    let isAllowed = isOwner;

    if (snippet.teamId) {
      isAllowed = await hasTeamPermission(req.user._id, snippet.teamId, "editor");
    }

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: "Unauthorized to edit this snippet" });
    }

    Object.assign(snippet, validatedData);
    await snippet.save();

    if (snippet.teamId) {
      await logActivity(snippet.teamId, req.user._id, "updated snippet", "snippet", snippet._id, snippet.title);
      // Emit socket event
      const io = req.app.get("io");
      if (io) io.to(`team_${snippet.teamId}`).emit("snippet:updated", snippet);
    }

    res.status(200).json({ success: true, data: snippet });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a snippet
// @route   DELETE /api/snippets/:id
// @access  Private
const deleteSnippet = async (req, res, next) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ success: false, message: "Snippet not found" });
    }

    // Permission check
    const isOwner = snippet.owner.toString() === req.user._id.toString();
    let isAllowed = isOwner;

    if (snippet.teamId) {
      isAllowed = await hasTeamPermission(req.user._id, snippet.teamId, "admin");
    }

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this snippet (Admin only)" });
    }

    const teamId = snippet.teamId;
    const title = snippet.title;

    await Snippet.findByIdAndDelete(req.params.id);

    if (teamId) {
      await logActivity(teamId, req.user._id, "deleted snippet", "snippet", null, title);
      // Emit socket event
      const io = req.app.get("io");
      if (io) io.to(`team_${teamId}`).emit("snippet:deleted", { id: req.params.id });
    }

    res.status(200).json({ success: true, message: "Snippet deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSnippets, createSnippet, getSnippetById, updateSnippet, deleteSnippet };

