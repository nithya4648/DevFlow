// backend/models/Activity.model.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    targetType: {
      type: String, // e.g. "project", "snippet", "doc"
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    targetName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
