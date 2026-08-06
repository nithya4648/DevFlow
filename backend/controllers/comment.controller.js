// backend/controllers/comment.controller.js
const Comment = require("../models/Comment.model");
const Team = require("../models/Team.model");
const Project = require("../models/Project.model");
const Snippet = require("../models/Snippet.model");
const Doc = require("../models/Doc.model");
const { createCommentSchema } = require("../validators/comment.validators");
const { hasTeamPermission } = require("../utils/rbac");
const logActivity = async () => {};

// Helper to find the teamId associated with the target
const getTargetTeamId = async (targetType, targetId) => {
  let target;
  if (targetType === "project") target = await Project.findById(targetId).select("teamId");
  if (targetType === "snippet") target = await Snippet.findById(targetId).select("teamId");
  if (targetType === "doc") target = await Doc.findById(targetId).select("teamId");
  return target?.teamId || null;
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

    // Verify user has access to target
    const teamId = await getTargetTeamId(targetType, targetId);
    if (teamId) {
      const allowed = await hasTeamPermission(req.user._id, teamId, "viewer");
      if (!allowed) {
        return res.status(403).json({ success: false, message: "Unauthorized to view comments" });
      }
    } else {
      // Private target validation (ensure user is owner)
      let target;
      if (targetType === "project") target = await Project.findById(targetId).select("owner");
      if (targetType === "snippet") target = await Snippet.findById(targetId).select("owner");
      if (targetType === "doc") target = await Doc.findById(targetId).select("owner");
      
      if (!target || target.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized to view comments" });
      }
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
    const teamId = await getTargetTeamId(targetType, targetId);

    // Verify access
    if (teamId) {
      const allowed = await hasTeamPermission(req.user._id, teamId, "editor");
      if (!allowed) return res.status(403).json({ success: false, message: "Unauthorized to comment" });
    } else {
      // Private target
      let target;
      if (targetType === "project") target = await Project.findById(targetId).select("owner title");
      if (targetType === "snippet") target = await Snippet.findById(targetId).select("owner title");
      if (targetType === "doc") target = await Doc.findById(targetId).select("owner title");

      if (!target || target.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized to comment" });
      }
    }

    const comment = await Comment.create({
      content,
      targetType,
      targetId,
      author: req.user._id,
      teamId,
    });

    const populated = await comment.populate("author", "name email avatar");

    // Log Activity if it is a team target
    if (teamId) {
      // Get target details
      let targetName = "";
      if (targetType === "project") {
        const p = await Project.findById(targetId).select("title");
        targetName = p?.title;
      } else if (targetType === "snippet") {
        const s = await Snippet.findById(targetId).select("title");
        targetName = s?.title;
      } else if (targetType === "doc") {
        const d = await Doc.findById(targetId).select("title");
        targetName = d?.title;
      }

      await logActivity(teamId, req.user._id, `commented on ${targetType}`, targetType, targetId, targetName);

      // Emit to team via socket
      const io = req.app.get("io");
      if (io) {
        io.to(`team_${teamId}`).emit("comment:new", populated);
      }
    }

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
    const comment = await Comment.findById(comment);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    // Allow author to delete, or team admin
    const isAuthor = comment.author.toString() === req.user._id.toString();
    let isAdmin = false;
    
    if (comment.teamId) {
      isAdmin = await hasTeamPermission(req.user._id, comment.teamId, "admin");
    }

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(req.params.id);

    // Emit to team via socket
    if (comment.teamId) {
      const io = req.app.get("io");
      if (io) {
        io.to(`team_${comment.teamId}`).emit("comment:deleted", { id: req.params.id });
      }
    }

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
