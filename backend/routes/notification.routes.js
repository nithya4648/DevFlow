// backend/routes/notification.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notification.controller");

router.use(protect);

router.route("/").get(getNotifications);
router.route("/mark-all-read").patch(markAllAsRead);
router.route("/:id/read").patch(markAsRead);

module.exports = router;
