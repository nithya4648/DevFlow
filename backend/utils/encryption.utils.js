const crypto = require('crypto');

// AES-256-GCM parameters
const IV_LENGTH = 12; // 96 bits, recommended for GCM
const TAG_LENGTH = 16; // 128 bits authentication tag

let _encryptionKey = null;

function getEncryptionKey() {
  if (_encryptionKey) return _encryptionKey;

  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is required.'
    );
  }

  const trimmed = raw.trim();

  // 1. Support 64-character hex string (32 bytes)
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    _encryptionKey = Buffer.from(trimmed, 'hex');
  } else {
    // 2. Try base64
    const base64Buf = Buffer.from(trimmed, 'base64');
    if (base64Buf.length === 32) {
      _encryptionKey = base64Buf;
    } else if (Buffer.from(trimmed, 'utf8').length === 32) {
      // 3. 32-byte raw utf-8 string
      _encryptionKey = Buffer.from(trimmed, 'utf8');
    } else {
      // 4. SHA-256 hash fallback to always produce a cryptographically solid 32-byte key
      _encryptionKey = crypto.createHash('sha256').update(trimmed).digest();
    }
  }

  return _encryptionKey;
}

function encrypt(text) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag();
  // Store iv + tag + ciphertext together
  const payload = Buffer.concat([iv, tag, Buffer.from(encrypted, 'base64')]);
  return payload.toString('base64');
}

function decrypt(payloadBase64) {
  const key = getEncryptionKey();
  const payload = Buffer.from(payloadBase64, 'base64');
  const iv = payload.subarray(0, IV_LENGTH);
  const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = payload.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encrypt, decrypt };
