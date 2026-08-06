// backend/controllers/apiVault.controller.js
const ApiVault = require("../models/ApiVault.model");
const { createApiVaultSchema, updateApiVaultSchema } = require("../validators/apiVault.validators");
const logger = require("../utils/logger");
const fs = require("fs");
const path = require("path");

// Audit logger — appends to backend/logs/vault-audit.log
const AUDIT_LOG_PATH = path.join(__dirname, "..", "logs", "vault-audit.log");

function auditLog(userId, action, vaultId, vaultName) {
  const line = `[${new Date().toISOString()}] user=${userId} action=${action} vaultId=${vaultId || "N/A"} name="${vaultName || "N/A"}"\n`;
  fs.mkdirSync(path.dirname(AUDIT_LOG_PATH), { recursive: true });
  fs.appendFile(AUDIT_LOG_PATH, line, (err) => {
    if (err) logger.error({ err }, "Failed to write vault audit log");
  });
}

// Mask a secret: show first 4 and last 4 chars, mask the rest
function maskSecret(str) {
  if (!str || str.length <= 8) return "••••••••";
  return str.slice(0, 4) + "••••••••" + str.slice(-4);
}

// @desc    List all vault entries for the current user
// @route   GET /api/api-vault
// @access  Private
const listVaults = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = { userId: req.user._id };

    if (category && category !== "all") {
      filter.category = category;
    }

    let vaults = await ApiVault.find(filter)
      .sort({ updatedAt: -1 })
      .lean();

    // Map the masked values to key and value for the frontend
    vaults = vaults.map((v) => ({
      ...v,
      key: v.maskedKey || "••••••••",
      value: v.maskedValue || "••••••••",
      // Remove encrypted fields from response just in case
      maskedKey: undefined,
      maskedValue: undefined
    }));

    // Search filter (on name/description, client-side-like but server)
    if (search) {
      const q = search.toLowerCase();
      vaults = vaults.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          (v.description && v.description.toLowerCase().includes(q))
      );
    }

    auditLog(req.user._id, "list", null, null);
    res.status(200).json({ success: true, data: vaults });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new vault entry
// @route   POST /api/api-vault
// @access  Private
const createVault = async (req, res, next) => {
  try {
    const validatedData = createApiVaultSchema.parse(req.body);

    // Check uniqueness of name per user
    const existing = await ApiVault.findOne({ userId: req.user._id, name: validatedData.name });
    if (existing) {
      return res.status(409).json({ success: false, message: "A vault entry with this name already exists" });
    }

    const vault = await ApiVault.create({
      ...validatedData,
      userId: req.user._id,
    });

    auditLog(req.user._id, "create", vault._id, vault.name);
    logger.info({ userId: req.user._id, vaultId: vault._id }, "API Vault entry created");

    res.status(201).json({
      success: true,
      data: {
        ...vault.toObject(),
        key: maskSecret(validatedData.key),
        value: maskSecret(validatedData.value),
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: error.errors[0]?.message || "Validation error", errors: error.errors });
    }
    next(error);
  }
};

// @desc    Get a specific vault entry (masked)
// @route   GET /api/api-vault/:id
// @access  Private
const getVault = async (req, res, next) => {
  try {
    const vault = await ApiVault.findById(req.params.id);
    if (!vault) {
      return res.status(404).json({ success: false, message: "Vault entry not found" });
    }
    if (vault.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    auditLog(req.user._id, "view", vault._id, vault.name);

    res.status(200).json({
      success: true,
      data: {
        ...vault.toObject(),
        key: vault.maskedKey || "••••••••",
        value: vault.maskedValue || "••••••••",
        maskedKey: undefined,
        maskedValue: undefined
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a vault entry
// @route   PUT /api/api-vault/:id
// @access  Private
const updateVault = async (req, res, next) => {
  try {
    const validatedData = updateApiVaultSchema.parse(req.body);

    const vault = await ApiVault.findById(req.params.id);
    if (!vault) {
      return res.status(404).json({ success: false, message: "Vault entry not found" });
    }
    if (vault.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // If name changed, check uniqueness
    if (validatedData.name && validatedData.name !== vault.name) {
      const existing = await ApiVault.findOne({ userId: req.user._id, name: validatedData.name });
      if (existing) {
        return res.status(409).json({ success: false, message: "A vault entry with this name already exists" });
      }
    }

    Object.assign(vault, validatedData);
    await vault.save();

    auditLog(req.user._id, "update", vault._id, vault.name);
    logger.info({ userId: req.user._id, vaultId: vault._id }, "API Vault entry updated");

    res.status(200).json({
      success: true,
      data: {
        ...vault.toObject(),
        key: vault.maskedKey || "••••••••",
        value: vault.maskedValue || "••••••••",
        maskedKey: undefined,
        maskedValue: undefined
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ success: false, message: error.errors[0]?.message || "Validation error", errors: error.errors });
    }
    next(error);
  }
};

// @desc    Delete a vault entry
// @route   DELETE /api/api-vault/:id
// @access  Private
const deleteVault = async (req, res, next) => {
  try {
    const vault = await ApiVault.findById(req.params.id);
    if (!vault) {
      return res.status(404).json({ success: false, message: "Vault entry not found" });
    }
    if (vault.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const vaultName = vault.name;
    await ApiVault.findByIdAndDelete(req.params.id);

    auditLog(req.user._id, "delete", req.params.id, vaultName);
    logger.info({ userId: req.user._id, vaultId: req.params.id }, "API Vault entry deleted");

    res.status(200).json({ success: true, message: "Vault entry deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Reveal the full decrypted key and value
// @route   GET /api/api-vault/:id/reveal
// @access  Private (rate-limited)
const revealVault = async (req, res, next) => {
  try {
    const vault = await ApiVault.findById(req.params.id);
    if (!vault) {
      return res.status(404).json({ success: false, message: "Vault entry not found" });
    }
    if (vault.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Update lastUsed timestamp
    vault.lastUsed = new Date();
    await vault.save();

    auditLog(req.user._id, "reveal", vault._id, vault.name);
    logger.info({ userId: req.user._id, vaultId: vault._id }, "API Vault entry revealed");

    res.status(200).json({
      success: true,
      data: {
        key: vault.decryptKey(),
        value: vault.decryptValue(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle active/inactive status
// @route   PATCH /api/api-vault/:id/toggle
// @access  Private
const toggleActive = async (req, res, next) => {
  try {
    const vault = await ApiVault.findById(req.params.id);
    if (!vault) {
      return res.status(404).json({ success: false, message: "Vault entry not found" });
    }
    if (vault.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    vault.isActive = !vault.isActive;
    await vault.save();

    auditLog(req.user._id, "toggle", vault._id, vault.name);

    res.status(200).json({
      success: true,
      data: {
        _id: vault._id,
        isActive: vault.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listVaults, createVault, getVault, updateVault, deleteVault, revealVault, toggleActive };
