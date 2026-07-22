// backend/validators/comment.validators.js
const { z } = require("zod");
const mongoose = require("mongoose");

const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required").max(1000, "Too long"),
  targetType: z.enum(["project", "snippet", "doc"]),
  targetId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid target ID",
    }),
});

module.exports = { createCommentSchema };
