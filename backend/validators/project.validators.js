// backend/validators/project.validators.js
const { z } = require("zod");

const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(120, "Title cannot exceed 120 characters")
    .trim(),
  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .trim()
    .optional()
    .default(""),
  status: z.enum(["todo", "in-progress", "done"]).optional().default("todo"),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  labels: z
    .array(z.string().trim().max(40))
    .max(10, "Cannot have more than 10 labels")
    .optional()
    .default([]),
  deadline: z.coerce.date().optional().nullable(),
  category: z
    .string()
    .max(60, "Category cannot exceed 60 characters")
    .trim()
    .optional()
    .default(""),
});

const updateProjectSchema = createProjectSchema.partial();

module.exports = { createProjectSchema, updateProjectSchema };
