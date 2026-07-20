// backend/controllers/bookmark.controller.js
const Bookmark = require("../models/Bookmark.model");
const { createBookmarkSchema, updateBookmarkSchema } = require("../validators/bookmark.validators");

// @desc    Get all bookmarks for logged-in user
// @route   GET /api/bookmarks
// @access  Private
const getBookmarks = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { owner: req.user._id };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { url: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const bookmarks = await Bookmark.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: bookmarks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a bookmark
// @route   POST /api/bookmarks
// @access  Private
const createBookmark = async (req, res, next) => {
  try {
    const validatedData = createBookmarkSchema.parse(req.body);
    const bookmark = await Bookmark.create({ ...validatedData, owner: req.user._id });
    res.status(201).json({ success: true, data: bookmark });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a bookmark
// @route   PUT /api/bookmarks/:id
// @access  Private
const updateBookmark = async (req, res, next) => {
  try {
    const validatedData = updateBookmarkSchema.parse(req.body);
    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: validatedData },
      { new: true, runValidators: true }
    ).lean();

    if (!bookmark) {
      const error = new Error("Bookmark not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: bookmark });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
const deleteBookmark = async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!bookmark) {
      const error = new Error("Bookmark not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, message: "Bookmark deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
};
