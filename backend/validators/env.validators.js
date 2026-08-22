// backend/validators/env.validators.js
const { z } = require("zod");
const mongoose = require("mongoose");

const createEnvSchema = z.object({
  projectId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid Project ID",
    })
    .nullable()
    .optional()
    .default(null),
  key: z
    .string()
    .min(3, "Key must be at least 3 characters")
    .max(128, "Key cannot exceed 128 characters")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Key must be a valid environment variable name (alphanumeric and underscores only)"),
  value: z
    .string()
    .min(1, "Value is required")
    .max(3000, "Value cannot exceed 3000 characters"),
});

const updateEnvSchema = z.object({
  key: z
    .string()
    .min(3, "Key must be at least 3 characters")
    .max(128, "Key cannot exceed 128 characters")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .optional(),
  value: z
    .string()
    .min(1, "Value is required")
    .max(3000, "Value cannot exceed 3000 characters")
    .optional(),
});

module.exports = { createEnvSchema, updateEnvSchema };
