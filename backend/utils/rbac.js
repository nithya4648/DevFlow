// backend/utils/rbac.js
const Team = require("../models/Team.model");

/**
 * Validates if a user has the required permission level for a team.
 * @param {string} userId - The user's ID
 * @param {string} teamId - The team's ID
 * @param {string} requiredRole - "viewer" | "editor" | "admin"
 * @returns {Promise<boolean>} true if user has required role, false otherwise
 */
const hasTeamPermission = async (userId, teamId, requiredRole = "viewer") => {
  if (!teamId) return true; // If no teamId is provided, assume it's a private resource and skip team RBAC
  
  const team = await Team.findById(teamId);
  if (!team) return false;

  const member = team.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  
  if (!member) return false;

  const roles = { admin: 3, editor: 2, viewer: 1 };
  
  const userRoleLevel = roles[member.role] || 0;
  const requiredRoleLevel = roles[requiredRole] || 1;

  return userRoleLevel >= requiredRoleLevel;
};

module.exports = { hasTeamPermission };
