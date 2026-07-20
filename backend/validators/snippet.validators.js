// backend/validators/snippet.validators.js
const { z } = require("zod");

const createSnippetSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(120, "Title cannot exceed 120 characters")
    .trim(),
  code: z
    .string()
    .min(1, "Code content is required")
    .max(100000, "Code is too long"),
  language: z
    .string()
    .min(1, "Language is required")
    .max(40)
    .trim()
    .default("plaintext"),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .trim()
    .optional()
    .default(""),
  folder: z
    .string()
    .max(60, "Folder name cannot exceed 60 characters")
    .trim()
    .optional()
    .default(""),
  tags: z
    .array(z.string().trim().max(40))
    .max(15, "Cannot have more than 15 tags")
    .optional()
    .default([]),
  isFavorite: z.boolean().optional().default(false),
});

const updateSnippetSchema = createSnippetSchema.partial();

module.exports = { createSnippetSchema, updateSnippetSchema };
