// backend/controllers/doc.controller.js
const Doc = require("../models/Doc.model");
const DocVersion = require("../models/DocVersion.model");
const Activity = require("../models/Activity.model");
const { createDocSchema, updateDocSchema } = require("../validators/doc.validators");
const { escapeRegex } = require("../utils/regex.utils");

const logActivity = async (userId, action, targetType, targetId, targetName) => {
  try {
    await Activity.create({ user: userId, action, targetType, targetId, targetName });
  } catch {
    // Activity logging should not fail the main request
  }
};

// @desc    Get all docs for logged-in user
// @route   GET /api/docs
// @access  Private
const getDocs = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;

    const filter = { owner: req.user._id };

    if (category) filter.category = category;
    if (search) {
      filter.title = { $regex: escapeRegex(search), $options: "i" };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [docs, total, categories] = await Promise.all([
      Doc.find(filter)
        .select("title category updatedAt createdAt")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Doc.countDocuments(filter),
      Doc.distinct("category", { owner: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      data: docs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
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

    const doc = await Doc.create({
      ...validatedData,
      owner: req.user._id,
    });

    await logActivity(req.user._id, "created document", "doc", doc._id, doc.title);

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
    const doc = await Doc.findById(req.params.id).lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const isOwner = doc.owner.toString() === req.user._id.toString();
    if (!isOwner) {
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
    if (!isOwner) {
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

    await logActivity(req.user._id, "updated document", "doc", existing._id, existing.title);

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
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this document" });
    }

    const title = doc.title;

    await Doc.findByIdAndDelete(req.params.id);
    await DocVersion.deleteMany({ docId: doc._id });

    await logActivity(req.user._id, "deleted document", "doc", null, title);

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
    if (!isOwner) {
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
    if (!isOwner) {
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
