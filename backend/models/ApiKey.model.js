const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema(
  {
    key: {
      type: String, // Stored as a hash
      required: [true, "Key hash is required"],
    },
    label: {
      type: String,
      required: [true, "Label is required"],
      trim: true,
    },
    prefix: {
      type: String, // e.g. "df_abcd" to identify the key in UI
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastUsed: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

module.exports = ApiKey;
