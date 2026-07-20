// backend/routes/snippet.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getSnippets,
  createSnippet,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
} = require("../controllers/snippet.controller");

router.use(protect);

router.route("/").get(getSnippets).post(createSnippet);
router.route("/:id").get(getSnippetById).put(updateSnippet).delete(deleteSnippet);

module.exports = router;
