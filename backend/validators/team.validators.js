// backend/validators/team.validators.js
const { z } = require("zod");
const mongoose = require("mongoose");

const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .max(100, "Team name cannot exceed 100 characters")
    .trim(),
});

const inviteMemberSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["admin", "editor", "viewer"]).optional().default("viewer"),
});

const changeRoleSchema = z.object({
  role: z.enum(["admin", "editor", "viewer"]),
});

module.exports = { createTeamSchema, inviteMemberSchema, changeRoleSchema };
