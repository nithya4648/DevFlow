// backend/controllers/snippet.controller.js
const Snippet = require("../models/Snippet.model");
const { createSnippetSchema, updateSnippetSchema } = require("../validators/snippet.validators");

// @desc    Get all snippets for logged-in user
// @route   GET /api/snippets
// @access  Private
const getSnippets = async (req, res, next) => {
  try {
    const { language, folder, tag, favorite, search, page = 1, limit = 100 } = req.query;

    const filter = { owner: req.user._id };

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
        .sort({ isFavorite: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Snippet.countDocuments(filter),
    ]);

    // Derive folder and tag lists from all user snippets (for sidebar)
    const [allFolders, allTags] = await Promise.all([
      Snippet.distinct("folder", { owner: req.user._id }),
      Snippet.distinct("tags", { owner: req.user._id }),
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
    const snippet = await Snippet.create({ ...validatedData, owner: req.user._id });
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
    const snippet = await Snippet.findOne({ _id: req.params.id, owner: req.user._id }).lean();
    if (!snippet) {
      const error = new Error("Snippet not found");
      error.statusCode = 404;
      return next(error);
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
    const snippet = await Snippet.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: validatedData },
      { new: true, runValidators: true }
    ).lean();

    if (!snippet) {
      const error = new Error("Snippet not found");
      error.statusCode = 404;
      return next(error);
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
    const snippet = await Snippet.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!snippet) {
      const error = new Error("Snippet not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, message: "Snippet deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSnippets, createSnippet, getSnippetById, updateSnippet, deleteSnippet };
