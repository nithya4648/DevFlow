// backend/controllers/doc.controller.js
const Doc = require("../models/Doc.model");
const DocVersion = require("../models/DocVersion.model");
const { createDocSchema, updateDocSchema } = require("../validators/doc.validators");

// @desc    Get all docs for logged-in user
// @route   GET /api/docs
// @access  Private
const getDocs = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { owner: req.user._id };

    if (category) filter.category = category;
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const [docs, categories] = await Promise.all([
      Doc.find(filter)
        .select("title category updatedAt createdAt") // exclude content for list view
        .sort({ updatedAt: -1 })
        .lean(),
      Doc.distinct("category", { owner: req.user._id }),
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
    const doc = await Doc.create({ ...validatedData, owner: req.user._id });
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
    const doc = await Doc.findOne({ _id: req.params.id, owner: req.user._id }).lean();
    if (!doc) {
      const error = new Error("Document not found");
      error.statusCode = 404;
      return next(error);
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

    // Fetch current before update to snapshot it
    const existing = await Doc.findOne({ _id: req.params.id, owner: req.user._id });
    if (!existing) {
      const error = new Error("Document not found");
      error.statusCode = 404;
      return next(error);
    }

    // Save version snapshot of the PREVIOUS state (before overwrite)
    await DocVersion.create({
      docId: existing._id,
      title: existing.title,
      content: existing.content,
      editedAt: existing.updatedAt,
    });

    // Now update
    const updated = await Doc.findByIdAndUpdate(
      existing._id,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).lean();

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a doc (also deletes all its versions)
// @route   DELETE /api/docs/:id
// @access  Private
const deleteDoc = async (req, res, next) => {
  try {
    const doc = await Doc.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!doc) {
      const error = new Error("Document not found");
      error.statusCode = 404;
      return next(error);
    }
    // Cascade-delete versions
    await DocVersion.deleteMany({ docId: doc._id });
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
    // Verify ownership via doc
    const doc = await Doc.findOne({ _id: req.params.id, owner: req.user._id }).lean();
    if (!doc) {
      const error = new Error("Document not found");
      error.statusCode = 404;
      return next(error);
    }

    const versions = await DocVersion.find({ docId: req.params.id })
      .select("title editedAt _id") // omit content for list — fetch on demand
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
    // Verify ownership via doc
    const doc = await Doc.findOne({ _id: req.params.id, owner: req.user._id }).lean();
    if (!doc) {
      const error = new Error("Document not found");
      error.statusCode = 404;
      return next(error);
    }

    const version = await DocVersion.findOne({
      _id: req.params.versionId,
      docId: req.params.id,
    }).lean();

    if (!version) {
      const error = new Error("Version not found");
      error.statusCode = 404;
      return next(error);
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
