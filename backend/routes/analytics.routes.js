const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getOverview,
  logToolUsage
} = require("../controllers/analytics.controller");

router.get("/overview", protect, getOverview);
router.post("/tool-usage", protect, logToolUsage);

module.exports = router;
