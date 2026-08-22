// backend/models/Note.model.js
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      default: "Untitled Note",
    },
    content: {
      type: String,
      default: "",
      maxlength: [100000, "Content cannot exceed 100,000 characters"],
    },
    folder: {
      type: String,
      trim: true,
      maxlength: [60, "Folder name cannot exceed 60 characters"],
      default: "Unfiled",
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

noteSchema.index({ owner: 1, folder: 1, updatedAt: -1 });
noteSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Note", noteSchema);
