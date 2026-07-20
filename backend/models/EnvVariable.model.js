// backend/models/EnvVariable.model.js
const mongoose = require("mongoose");
const { encrypt, decrypt } = require("../utils/crypto");

const envVariableSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null, // null means global/unscoped
    },
    key: {
      type: String,
      required: [true, "Key is required"],
      trim: true,
      maxlength: [100, "Key cannot exceed 100 characters"],
    },
    value: {
      type: String,
      required: [true, "Value is required"],
      // The getter decrypts the value automatically when accessed
      get: (encryptedValue) => decrypt(encryptedValue),
      // The setter encrypts the value before saving
      set: (plaintextValue) => encrypt(plaintextValue),
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// A user cannot have the same key twice in the same project (or same key twice globally)
envVariableSchema.index({ owner: 1, projectId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("EnvVariable", envVariableSchema);
