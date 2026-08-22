const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
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

module.exports = router;
