// backend/validators/apiVault.validators.js
const { z } = require("zod");

const CATEGORIES = ["payment", "ai", "database", "cloud", "other"];

const createApiVaultSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(150, "Name cannot exceed 150 characters")
    .trim(),
  key: z
    .string()
    .min(1, "API key must be between 1 and 2048 characters")
    .max(2048, "API key must be between 1 and 2048 characters"),
  value: z
    .string()
    .max(10000, "Value is too long")
    .optional()
    .default(""),
  category: z
    .enum(CATEGORIES, { errorMap: () => ({ message: `Category must be one of: ${CATEGORIES.join(", ")}` }) })
    .default("other"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional()
    .default(""),
});

const updateApiVaultSchema = createApiVaultSchema.partial();

module.exports = { createApiVaultSchema, updateApiVaultSchema, CATEGORIES };
