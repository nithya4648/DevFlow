// backend/controllers/note.controller.js
const Note = require("../models/Note.model");
const { createNoteSchema, updateNoteSchema } = require("../validators/note.validators");
const { escapeRegex } = require("../utils/regex.utils");

// @desc    Get all notes for logged-in user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res, next) => {
  try {
    const { folder, search, page = 1, limit = 50 } = req.query;
    const filter = { owner: req.user._id };

    if (folder) filter.folder = folder;
    if (search) {
      const searchRegex = { $regex: escapeRegex(search), $options: "i" };
      filter.$or = [
        { title: searchRegex },
        { content: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [notes, total, folders] = await Promise.all([
      Note.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Note.countDocuments(filter),
      Note.distinct("folder", { owner: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: notes,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
      meta: {
        folders: folders.filter(Boolean).sort(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res, next) => {
  try {
    const validatedData = createNoteSchema.parse(req.body);
    const note = await Note.create({ ...validatedData, owner: req.user._id });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res, next) => {
  try {
    const validatedData = updateNoteSchema.parse(req.body);
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: validatedData },
      { new: true, runValidators: true }
    ).lean();

    if (!note) {
      const error = new Error("Note not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!note) {
      const error = new Error("Note not found");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
};
