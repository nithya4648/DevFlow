// backend/models/Comment.model.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["project", "snippet", "doc"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ targetType: 1, targetId: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", commentSchema);
