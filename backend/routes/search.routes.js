// backend/routes/search.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { globalSearch } = require("../controllers/search.controller");

// GET /api/search?q=&type=
router.get("/", protect, globalSearch);

module.exports = router;
