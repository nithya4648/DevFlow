// backend/models/Snippet.model.js
const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Snippet title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    code: {
      type: String,
      required: [true, "Code content is required"],
      maxlength: [100000, "Code cannot exceed 100,000 characters"],
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      trim: true,
      default: "plaintext",
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    folder: {
      type: String,
      trim: true,
      maxlength: [60, "Folder name cannot exceed 60 characters"],
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Efficient queries
snippetSchema.index({ owner: 1, language: 1, isFavorite: 1, createdAt: -1 });
// Tag-based filtering
snippetSchema.index({ tags: 1, owner: 1 });
// Text search on title and description (set language_override to avoid conflicts with snippet language field)
snippetSchema.index({ title: "text", description: "text" }, { language_override: "text_language" });

module.exports = mongoose.model("Snippet", snippetSchema);
