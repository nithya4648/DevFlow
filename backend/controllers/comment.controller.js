// backend/controllers/comment.controller.js
const Comment = require("../models/Comment.model");
const Project = require("../models/Project.model");
const Snippet = require("../models/Snippet.model");
const Doc = require("../models/Doc.model");
const Activity = require("../models/Activity.model");
const { createCommentSchema } = require("../validators/comment.validators");

const logActivity = async (userId, action, targetType, targetId, targetName) => {
  try {
    await Activity.create({ user: userId, action, targetType, targetId, targetName });
  } catch {
    // Non-blocking
  }
};

// @desc    Get comments for a target
// @route   GET /api/comments
// @access  Private
const getComments = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) {
      return res.status(400).json({ success: false, message: "targetType and targetId are required" });
    }

    // Verify user has access to target (owner check)
    let target;
    if (targetType === "project") target = await Project.findById(targetId).select("owner");
    if (targetType === "snippet") target = await Snippet.findById(targetId).select("owner");
    if (targetType === "doc") target = await Doc.findById(targetId).select("owner");

    if (!target || target.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to view comments" });
    }

    const comments = await Comment.find({ targetType, targetId })
      .populate("author", "name email avatar")
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    const { content, targetType, targetId } = createCommentSchema.parse(req.body);

    // Verify access (owner check)
    let target;
    if (targetType === "project") target = await Project.findById(targetId).select("owner title");
    if (targetType === "snippet") target = await Snippet.findById(targetId).select("owner title");
    if (targetType === "doc") target = await Doc.findById(targetId).select("owner title");

    if (!target || target.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to comment" });
    }

    const comment = await Comment.create({
      content,
      targetType,
      targetId,
      author: req.user._id,
    });

    const populated = await comment.populate("author", "name email avatar");

    const targetName = target?.title || "";
    await logActivity(req.user._id, `commented on ${targetType}`, targetType, targetId, targetName);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    // Allow author to delete
    const isAuthor = comment.author.toString() === req.user._id.toString();

    if (!isAuthor) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  createComment,
  deleteComment,
};
