const Invite = require("../models/Invite.model");
const Team = require("../models/Team.model");
const User = require("../models/User.model");

const acceptInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const invite = await Invite.findOne({ token, status: "pending", expiresAt: { $gt: new Date() } });
    if (!invite) {
      return res.status(400).send("Invitation token is invalid or has expired.");
    }

    const user = await User.findOne({ email: invite.email });
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    if (user) {
      const team = await Team.findById(invite.teamId);
      if (team) {
        const isMember = team.members.some(m => m.user.toString() === user._id.toString());
        if (!isMember) {
          team.members.push({ user: user._id, role: invite.role });
          await team.save();
        }
      }
      invite.status = "accepted";
      await invite.save();
      return res.redirect(`${clientUrl}/login?message=InvitationAccepted`);
    } else {
      return res.redirect(`${clientUrl}/register?email=${encodeURIComponent(invite.email)}&inviteToken=${token}`);
    }
  } catch (error) {
    next(error);
  }
};

const rejectInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const invite = await Invite.findOne({ token, status: "pending" });
    if (!invite) {
      return res.status(400).send("Invitation token is invalid or already processed.");
    }
    invite.status = "rejected";
    await invite.save();
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/login?message=InvitationRejected`);
  } catch (error) {
    next(error);
  }
};

module.exports = { acceptInvite, rejectInvite };
