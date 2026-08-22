// backend/controllers/snippet.controller.js
const Snippet = require("../models/Snippet.model");
const Activity = require("../models/Activity.model");
const { createSnippetSchema, updateSnippetSchema } = require("../validators/snippet.validators");
const { escapeRegex } = require("../utils/regex.utils");

const logActivity = async (userId, action, targetType, targetId, targetName) => {
  try {
    await Activity.create({ user: userId, action, targetType, targetId, targetName });
  } catch {
    // Non-blocking activity logging
  }
};

// @desc    Get all snippets for logged-in user
// @route   GET /api/snippets
// @access  Private
const getSnippets = async (req, res, next) => {
  try {
    const { language, folder, tag, favorite, search, page = 1, limit = 50 } = req.query;

    const filter = { owner: req.user._id };

    if (language) filter.language = language;
    if (folder !== undefined) filter.folder = folder;
    if (tag) filter.tags = { $in: [tag] };
    if (favorite === "true") filter.isFavorite = true;

    if (search) {
      const searchRegex = { $regex: escapeRegex(search), $options: "i" };
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { code: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [snippets, total, allFolders, allTags] = await Promise.all([
      Snippet.find(filter)
        .sort({ isFavorite: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Snippet.countDocuments(filter),
      Snippet.distinct("folder", { owner: req.user._id }),
      Snippet.distinct("tags", { owner: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: snippets,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
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

    const snippet = await Snippet.create({
      ...validatedData,
      owner: req.user._id,
    });

    await logActivity(req.user._id, "created snippet", "snippet", snippet._id, snippet.title);

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
    const snippet = await Snippet.findById(req.params.id).lean();

    if (!snippet) {
      return res.status(404).json({ success: false, message: "Snippet not found" });
    }

    const isOwner = snippet.owner.toString() === req.user._id.toString();
    if (!isOwner) {
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

    const isOwner = snippet.owner.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized to edit this snippet" });
    }

    Object.assign(snippet, validatedData);
    await snippet.save();

    await logActivity(req.user._id, "updated snippet", "snippet", snippet._id, snippet.title);

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

    const isOwner = snippet.owner.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this snippet" });
    }

    const title = snippet.title;
    await Snippet.findByIdAndDelete(req.params.id);

    await logActivity(req.user._id, "deleted snippet", "snippet", null, title);

    res.status(200).json({ success: true, message: "Snippet deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSnippets, createSnippet, getSnippetById, updateSnippet, deleteSnippet };
