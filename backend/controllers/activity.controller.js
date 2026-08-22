const Activity = require("../models/Activity.model");
const logger = require("../utils/logger");

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

const deleteActivity = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    
    const activity = await Activity.findById(activityId);
    if (!activity) {
      const error = new Error("Activity not found");
      error.statusCode = 404;
      return next(error);
    }

    if (activity.user.toString() !== req.user._id.toString()) {
      const error = new Error("Not authorized to delete this activity");
      error.statusCode = 403;
      return next(error);
    }

    await Activity.findByIdAndDelete(activityId);
    
    logger.info({ userId: req.user._id, activityId }, "Activity deleted");
    res.status(200).json({ success: true, message: "Activity deleted" });
  } catch (error) {
    next(error);
  }
};

const deleteAllActivity = async (req, res, next) => {
  try {
    const result = await Activity.deleteMany({ user: req.user._id });
    
    logger.info({ userId: req.user._id, count: result.deletedCount }, "All activities deleted");
    res.status(200).json({ success: true, message: `Deleted ${result.deletedCount} activities` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyActivity,
  deleteActivity,
  deleteAllActivity,
};
