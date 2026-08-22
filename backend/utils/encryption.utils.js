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
      'ENCRYPTION_KEY environment variable is required. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
    );
  }

  _encryptionKey = Buffer.from(raw, 'base64');
  if (_encryptionKey.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 256-bit (32 byte) base64-encoded string');
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
