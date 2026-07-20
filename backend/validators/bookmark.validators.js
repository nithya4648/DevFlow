// backend/validators/bookmark.validators.js
const { z } = require("zod");

const createBookmarkSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .trim(),
  url: z
    .string()
    .url("Must be a valid URL")
    .max(2000, "URL is too long")
    .trim(),
  category: z
    .enum(["docs", "repo", "website", "api", "article", "video", "other"])
    .optional()
    .default("website"),
  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .default(""),
});

const updateBookmarkSchema = createBookmarkSchema.partial();

module.exports = { createBookmarkSchema, updateBookmarkSchema };
