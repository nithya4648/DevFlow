const express = require("express");
const router = express.Router();
const { acceptInvite, rejectInvite } = require("../controllers/invite.controller");

router.get("/:token/accept", acceptInvite);
router.get("/:token/reject", rejectInvite);

module.exports = router;
