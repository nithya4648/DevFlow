// backend/utils/crypto.js
const crypto = require("crypto");

// 32-byte key for AES-256
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
  ? Buffer.from(process.env.ENCRYPTION_KEY, "hex")
  : crypto.randomBytes(32); // Fallback so it doesn't crash, but won't persist across restarts if not set

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a plaintext string.
 * @param {string} text - The plaintext to encrypt.
 * @returns {string} - The encrypted payload: iv:salt:tag:ciphertext
 */
const encrypt = (text) => {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Deriving key using PBKDF2 allows us to add a salt to the base encryption key
  const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, "sha512");

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();

  // Format: iv:salt:tag:ciphertext
  return `${iv.toString("hex")}:${salt.toString("hex")}:${tag.toString(
    "hex"
  )}:${encrypted}`;
};

/**
 * Decrypts an encrypted payload.
 * @param {string} encryptedPayload - The payload to decrypt (iv:salt:tag:ciphertext)
 * @returns {string} - The decrypted plaintext
 */
const decrypt = (encryptedPayload) => {
  if (!encryptedPayload) return "";
  try {
    const parts = encryptedPayload.split(":");
    if (parts.length !== 4) throw new Error("Invalid payload format");

    const iv = Buffer.from(parts[0], "hex");
    const salt = Buffer.from(parts[1], "hex");
    const tag = Buffer.from(parts[2], "hex");
    const encryptedText = parts[3];

    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, 100000, 32, "sha512");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return "[DECRYPTION_ERROR]";
  }
};

module.exports = { encrypt, decrypt };
