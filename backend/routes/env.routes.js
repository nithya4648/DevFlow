// backend/routes/env.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getEnvVars,
  createEnvVar,
  updateEnvVar,
  deleteEnvVar,
} = require("../controllers/env.controller");

router.use(protect);

router.route("/").get(getEnvVars).post(createEnvVar);
router.route("/:id").put(updateEnvVar).delete(deleteEnvVar);

module.exports = router;
