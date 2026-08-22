const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getOverview,
  logToolUsage,
  getContributions
} = require("../controllers/analytics.controller");
const {
  getMyActivity,
  deleteActivity,
  clearAllActivity
} = require("../controllers/activity.controller");

router.get("/overview", protect, getOverview);
router.post("/tool-usage", protect, logToolUsage);
router.get("/contributions", protect, getContributions);
router.get("/my-activity", protect, getMyActivity);
router.delete("/my-activity/:id", protect, deleteActivity);
router.delete("/my-activity", protect, clearAllActivity);

module.exports = router;
