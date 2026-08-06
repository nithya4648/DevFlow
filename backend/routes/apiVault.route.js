// backend/routes/apiVault.route.js
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { protect } = require("../middleware/auth.middleware");
const {
  listVaults,
  createVault,
  getVault,
  updateVault,
  deleteVault,
  revealVault,
  toggleActive,
} = require("../controllers/apiVault.controller");

const isTest = process.env.NODE_ENV === "test";

// Rate limit: reveal endpoint — max 5 per minute per user
const revealLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTest ? 10000 : 5,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { success: false, message: "Too many reveal requests. Please try again in a minute." },
});

// Rate limit: create endpoint — max 20 per hour per user
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isTest ? 10000 : 20,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: { success: false, message: "Too many vault entries created. Please try again later." },
});

// All routes require authentication
router.use(protect);

router.route("/")
  .get(listVaults)
  .post(createLimiter, createVault);

router.route("/:id")
  .get(getVault)
  .put(updateVault)
  .delete(deleteVault);

router.get("/:id/reveal", revealLimiter, revealVault);
router.patch("/:id/toggle", toggleActive);

module.exports = router;
