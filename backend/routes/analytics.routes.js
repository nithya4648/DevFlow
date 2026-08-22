const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const Activity = require("../models/Activity.model");
const {
  getOverview,
  logToolUsage,
  getContributions
} = require("../controllers/analytics.controller");
const { getMyActivity } = require("../controllers/activity.controller");

router.get("/overview", protect, getOverview);
router.post("/tool-usage", protect, logToolUsage);
router.get("/contributions", protect, getContributions);
router.get("/my-activity", protect, getMyActivity);

router.delete("/activities/:activityId", protect, async (req, res, next) => {
  try {
    const activity = await Activity.findOneAndDelete({
      _id: req.params.activityId,
      user: req.user._id,
    });
    if (!activity) {
      return res.status(404).json({ success: false, message: "Activity not found" });
    }
    res.json({ success: true, message: "Activity deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
