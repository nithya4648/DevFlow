// backend/controllers/activity.controller.js
const Activity = require("../models/Activity.model");
const { hasTeamPermission } = require("../utils/rbac");

// @desc    Get activity logs for a team
// @route   GET /api/teams/:id/activity
// @access  Private
const getTeamActivity = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    
    const allowed = await hasTeamPermission(req.user._id, teamId, "viewer");
    if (!allowed) {
      return res.status(403).json({ success: false, message: "Unauthorized to view activity" });
    }

    const activities = await Activity.find({ team: teamId })
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs for the logged-in user
// @route   GET /api/analytics/my-activity
// @access  Private
const getMyActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeamActivity,
  getMyActivity,
};
