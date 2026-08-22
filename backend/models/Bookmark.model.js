// backend/models/Bookmark.model.js
const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
      maxlength: [2000, "URL is too long"],
    },
    category: {
      type: String,
      enum: ["docs", "repo", "website", "api", "article", "video", "other"],
      default: "website",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.index({ owner: 1, category: 1, createdAt: -1 });
bookmarkSchema.index({ title: "text", url: "text", notes: "text" });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
