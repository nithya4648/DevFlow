const mongoose = require("mongoose");

const toolUsageSchema = new mongoose.Schema(
  {
    tool: {
      type: String,
      required: true,
      index: true,
    },
    user: {
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

// We keep it lightweight; we just insert a document every time it's used.
const ToolUsage = mongoose.model("ToolUsage", toolUsageSchema);

module.exports = ToolUsage;
