const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getApiKeys,
  createApiKey,
  revokeApiKey,
} = require("../controllers/api-key.controller");

router.get("/", protect, getApiKeys);
router.post("/", protect, createApiKey);
router.delete("/:id", protect, revokeApiKey);

module.exports = router;
