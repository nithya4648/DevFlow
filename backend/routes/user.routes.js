const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const {
  updateProfile,
  updatePassword,
  updatePreferences,
  getSessions,
  revokeSession,
} = require("../controllers/user.controller");

router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.put("/password", protect, updatePassword);
router.put("/preferences", protect, updatePreferences);
router.get("/sessions", protect, getSessions);
router.delete("/sessions/:id", protect, revokeSession);

module.exports = router;
