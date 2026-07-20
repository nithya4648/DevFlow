// backend/models/DocVersion.model.js
const mongoose = require("mongoose");

const docVersionSchema = new mongoose.Schema(
  {
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doc",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      default: "",
    },
    editedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // editedAt is our only timestamp
  }
);

// Efficient version lookups by doc
docVersionSchema.index({ docId: 1, editedAt: -1 });

module.exports = mongoose.model("DocVersion", docVersionSchema);
