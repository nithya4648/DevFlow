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
    .min(1, "Key is required")
    .max(100, "Key cannot exceed 100 characters")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Key must be a valid environment variable name (alphanumeric and underscores only)"),
  value: z
    .string()
    .min(1, "Value is required")
    .max(50000, "Value cannot exceed 50000 characters"),
});

const updateEnvSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .max(100)
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .optional(),
  value: z
    .string()
    .min(1, "Value is required")
    .max(50000, "Value cannot exceed 50000 characters")
    .optional(),
});

module.exports = { createEnvSchema, updateEnvSchema };
