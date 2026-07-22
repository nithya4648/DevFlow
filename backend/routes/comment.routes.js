// backend/routes/comment.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getComments,
  createComment,
  deleteComment,
} = require("../controllers/comment.controller");

router.use(protect);

router.route("/").get(getComments).post(createComment);
router.route("/:id").delete(deleteComment);

module.exports = router;
