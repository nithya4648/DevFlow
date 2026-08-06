// backend/routes/team.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getTeams,
  getTeamById,
  createTeam,
  addMember,
  changeMemberRole,
  removeMember,
  deleteTeam,
} = require("../controllers/team.controller");
const { getTeamActivity } = require("../controllers/activity.controller");

router.use(protect);

router.route("/").get(getTeams).post(createTeam);
router.route("/:id").get(getTeamById).delete(deleteTeam);
router.route("/:id/members").post(addMember);
router.route("/:id/activity").get(getTeamActivity);
router.route("/:id/members/:userId").put(changeMemberRole).delete(removeMember);

module.exports = router;

