const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getOverview,
  logToolUsage,
  getContributions
} = require("../controllers/analytics.controller");

router.get("/overview", protect, getOverview);
router.post("/tool-usage", protect, logToolUsage);
router.get("/contributions", protect, getContributions);

module.exports = router;
