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

// @desc    Delete a specific activity log
// @route   DELETE /api/analytics/my-activity/:id
// @access  Private
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!activity) {
      const error = new Error("Activity not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ success: true, message: "Activity deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all activity logs for current user
// @route   DELETE /api/analytics/my-activity
// @access  Private
const clearAllActivity = async (req, res, next) => {
  try {
    await Activity.deleteMany({ user: req.user._id });
    res.status(200).json({ success: true, message: "All activity cleared" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyActivity,
  deleteActivity,
  clearAllActivity,
};
