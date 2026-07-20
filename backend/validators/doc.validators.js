// backend/validators/doc.validators.js
const { z } = require("zod");

const createDocSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),
  content: z
    .string()
    .max(500000, "Content is too large")
    .optional()
    .default(""),
  category: z
    .string()
    .max(60, "Category cannot exceed 60 characters")
    .trim()
    .optional()
    .default("General"),
});

const updateDocSchema = createDocSchema.partial();

module.exports = { createDocSchema, updateDocSchema };
