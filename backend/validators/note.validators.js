// backend/validators/note.validators.js
const { z } = require("zod");

const createNoteSchema = z.object({
  title: z
    .string()
    .max(200, "Title cannot exceed 200 characters")
    .trim()
    .optional()
    .default("Untitled Note"),
  content: z
    .string()
    .max(100000, "Content is too large")
    .optional()
    .default(""),
  folder: z
    .string()
    .max(60, "Folder cannot exceed 60 characters")
    .trim()
    .optional()
    .default("Unfiled"),
});

const updateNoteSchema = createNoteSchema.partial();

module.exports = { createNoteSchema, updateNoteSchema };
