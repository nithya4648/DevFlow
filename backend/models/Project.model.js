// backend/models/Project.model.js
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    labels: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      trim: true,
      maxlength: [60, "Category cannot exceed 60 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries with filters
projectSchema.index({ owner: 1, teamId: 1, status: 1, priority: 1, createdAt: -1 });
// Text search
projectSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Project", projectSchema);
