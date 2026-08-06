// backend/controllers/team.controller.js
const Team = require("../models/Team.model");
const User = require("../models/User.model");
const Activity = require("../models/Activity.model");
const { createTeamSchema, inviteMemberSchema, changeRoleSchema } = require("../validators/team.validators");
const { emitNotificationToUser } = require("../utils/socketService");

// Helper to log activity
const logActivity = async (teamId, userId, action, targetType, targetId, targetName) => {
  await Activity.create({
    team: teamId,
    user: userId,
    action,
    targetType,
    targetId,
    targetName,
  });
  // Note: we will emit this via socket below when needed
};

// @desc    Get user's teams
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({ "members.user": req.user._id })
      .populate("members.user", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single team by ID
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findOne({ _id: req.params.id, "members.user": req.user._id })
      .populate("members.user", "name email avatar")
      .lean();
    
    if (!team) {
      const error = new Error("Team not found or unauthorized");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res, next) => {
  try {
    const validatedData = createTeamSchema.parse(req.body);
    const team = await Team.create({
      name: validatedData.name,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    });

    await logActivity(team._id, req.user._id, "created the team", "team", team._id, team.name);

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const { email, role } = inviteMemberSchema.parse(req.body);
    const teamId = req.params.id;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    // Check admin
    const currentMember = team.members.find(m => m.user.toString() === req.user._id.toString());
    const isOwner = team.owner.toString() === req.user._id.toString();
    if ((!currentMember || currentMember.role !== "admin") && !isOwner) {
      return res.status(403).json({ success: false, message: "Only owners or admins can invite members" });
    }

    const invitee = await User.findOne({ email: email.toLowerCase() });
    if (invitee && team.members.some(m => m.user.toString() === invitee._id.toString())) {
      return res.status(400).json({ success: false, message: "User is already a member" });
    }

    // Create Invite
    const crypto = require("crypto");
    const Invite = require("../models/Invite.model");
    const { sendEmail } = require("../utils/email.utils");

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await Invite.create({
      email: email.toLowerCase(),
      teamId,
      invitedBy: req.user._id,
      role,
      token,
      expiresAt,
    });

    const socketUrl = process.env.VITE_SOCKET_URL || `http://localhost:${process.env.PORT || 5000}`;
    const acceptLink = `${socketUrl}/api/invites/${token}/accept`;
    const rejectLink = `${socketUrl}/api/invites/${token}/reject`;

    // Send Email via Resend
    await sendEmail({
      to: email.toLowerCase(),
      subject: `Invitation to join team ${team.name} on DevFlow`,
      text: `You have been invited to join the team ${team.name} as a ${role}. Accept invitation: ${acceptLink} | Reject: ${rejectLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #6366f1; text-align: center;">Team Invitation</h2>
          <p>Hi there,</p>
          <p>You have been invited by <strong>${req.user.name}</strong> to join the team <strong>${team.name}</strong> as a <strong>${role}</strong> on DevFlow.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-right: 10px;">Accept Invite</a>
            <a href="${rejectLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reject</a>
          </div>
          <p>This invitation link is valid for 7 days.</p>
        </div>
      `,
    });

    await logActivity(teamId, req.user._id, `invited ${email} as ${role}`, "user", null, email);

    res.status(200).json({ success: true, message: "Invitation email sent successfully" });
  } catch (error) {
    next(error);
  }
};


// @desc    Change member role
// @route   PATCH /api/teams/:id/members/:userId
// @access  Private
const changeMemberRole = async (req, res, next) => {
  try {
    const { role } = changeRoleSchema.parse(req.body);
    const teamId = req.params.id;
    const targetUserId = req.params.userId;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    // Check admin
    const currentMember = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (!currentMember || currentMember.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admins can change roles" });
    }

    if (team.owner.toString() === targetUserId && role !== "admin") {
      return res.status(400).json({ success: false, message: "Cannot change the owner's role" });
    }

    const memberToUpdate = team.members.find(m => m.user.toString() === targetUserId);
    if (!memberToUpdate) return res.status(404).json({ success: false, message: "Member not found in team" });

    memberToUpdate.role = role;
    await team.save();

    res.status(200).json({ success: true, message: "Role updated" });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private
const removeMember = async (req, res, next) => {
  try {
    const teamId = req.params.id;
    const targetUserId = req.params.userId;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    const currentMember = team.members.find(m => m.user.toString() === req.user._id.toString());
    
    // User can remove themselves, or an admin can remove them
    const isSelfRemoval = req.user._id.toString() === targetUserId;
    if (!currentMember || (currentMember.role !== "admin" && !isSelfRemoval)) {
      return res.status(403).json({ success: false, message: "Unauthorized to remove this member" });
    }

    if (team.owner.toString() === targetUserId) {
      return res.status(400).json({ success: false, message: "The team owner cannot be removed" });
    }

    team.members = team.members.filter(m => m.user.toString() !== targetUserId);
    await team.save();

    if (!isSelfRemoval) {
      await logActivity(teamId, req.user._id, "removed a member", "team", null, "");
    } else {
      await logActivity(teamId, targetUserId, "left the team", "team", null, "");
    }

    res.status(200).json({ success: true, message: "Member removed" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a team
// @route   DELETE /api/teams/:id
// @access  Private
const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the team owner can delete the team" });
    }

    await Team.findByIdAndDelete(req.params.id);
    await Activity.deleteMany({ team: req.params.id });

    res.status(200).json({ success: true, message: "Team deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  inviteMember,
  changeMemberRole,
  removeMember,
  deleteTeam,
  logActivity,
};
