// backend/routes/bookmark.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} = require("../controllers/bookmark.controller");

router.use(protect);

router.route("/").get(getBookmarks).post(createBookmark);
router.route("/:id").put(updateBookmark).delete(deleteBookmark);

module.exports = router;
