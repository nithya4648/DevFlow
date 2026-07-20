// backend/models/Doc.model.js
const mongoose = require("mongoose");

const docSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      default: "",
      maxlength: [500000, "Content cannot exceed 500,000 characters"],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [60, "Category cannot exceed 60 characters"],
      default: "General",
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

docSchema.index({ owner: 1, category: 1, updatedAt: -1 });
docSchema.index({ title: "text" });

module.exports = mongoose.model("Doc", docSchema);
