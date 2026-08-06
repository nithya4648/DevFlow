// backend/routes/project.routes.js
const express = require("express");
const router = express.Router();
const { protect, requireTeamAdmin } = require("../middleware/auth.middleware");
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

// All project routes are protected
router.use(protect);

router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProjectById).put(requireTeamAdmin, updateProject).delete(requireTeamAdmin, deleteProject);

module.exports = router;

