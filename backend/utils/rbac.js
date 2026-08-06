/**
 * Validates if a user has the required permission level for a team.
 * Since teams feature is disabled, if teamId is provided, returns false (unauthorized).
 * @param {string} userId - The user's ID
 * @param {string} teamId - The team's ID
 * @param {string} requiredRole - "viewer" | "editor" | "admin"
 * @returns {Promise<boolean>} true if user has required role, false otherwise
 */
const hasTeamPermission = async (userId, teamId, requiredRole = "viewer") => {
  if (!teamId) return true; // Private resource
  return false; // Teams are disabled
};

module.exports = { hasTeamPermission };
