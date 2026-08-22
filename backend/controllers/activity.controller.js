// backend/controllers/activity.controller.js
const Activity = require("../models/Activity.model");

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
  getMyActivity,
};
