const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption.utils');

const apiVaultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    value: {
      type: String,
    },
    category: {
      type: String,
      enum: ['payment', 'ai', 'database', 'cloud', 'other'],
      default: 'other',
    },
    description: {
      type: String,
    },
    maskedKey: {
      type: String,
    },
    maskedValue: {
      type: String,
    },
    lastUsed: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Unique name per user
apiVaultSchema.index({ userId: 1, name: 1 }, { unique: true });

// Mask a secret: show first 4 and last 4 chars, mask the rest
function maskSecret(str) {
  if (!str || str.length <= 8) return "••••••••";
  return str.slice(0, 4) + "••••••••" + str.slice(-4);
}

// Encrypt key and value before saving
apiVaultSchema.pre('save', function (next) {
  if (this.isModified('key')) {
    this.maskedKey = maskSecret(this.key);
    this.key = encrypt(this.key);
  }
  if (this.isModified('value')) {
    this.maskedValue = maskSecret(this.value);
    this.value = encrypt(this.value);
  }
  next();
});

// Decrypt methods (do not expose encrypted values directly)
apiVaultSchema.methods.decryptKey = function () {
  return decrypt(this.key);
};

apiVaultSchema.methods.decryptValue = function () {
  return decrypt(this.value);
};

module.exports = mongoose.model('ApiVault', apiVaultSchema);
