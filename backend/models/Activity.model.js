// backend/models/Activity.model.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      // e.g. "created a project", "commented on a snippet", "updated a document"
    },
    targetType: {
      type: String, // e.g. "project", "snippet", "doc", "team"
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    targetName: {
      type: String, // Denormalized name (e.g. Project title) so if deleted, activity still makes sense
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ team: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
