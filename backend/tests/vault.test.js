const { encrypt, decrypt } = require("../utils/encryption.utils");

describe("Vault Cryptography (AES-256-GCM)", () => {
  beforeAll(() => {
    if (!process.env.ENCRYPTION_KEY) {
      // 32-byte base64 test key
      process.env.ENCRYPTION_KEY = Buffer.alloc(32, 1).toString("base64");
    }
  });

  test("encrypts and decrypts a secret text correctly", () => {
    const plainText = "sk_live_1234567890abcdef_DevFlow_API_Secret";
    const cipherText = encrypt(plainText);

    expect(cipherText).not.toBe(plainText);
    expect(typeof cipherText).toBe("string");

    const decrypted = decrypt(cipherText);
    expect(decrypted).toBe(plainText);
  });

  test("produces different ciphertext for identical inputs due to random IVs", () => {
    const plainText = "SAME_SECRET_STRING";
    const cipher1 = encrypt(plainText);
    const cipher2 = encrypt(plainText);

    expect(cipher1).not.toBe(cipher2);
    expect(decrypt(cipher1)).toBe(plainText);
    expect(decrypt(cipher2)).toBe(plainText);
  });

  test("fails decryption with tampered ciphertext or auth tag", () => {
    const plainText = "super-secret-vault-key";
    const cipherText = encrypt(plainText);
    
    // Corrupt payload
    const buf = Buffer.from(cipherText, "base64");
    buf[buf.length - 1] = buf[buf.length - 1] ^ 0xff;
    const tampered = buf.toString("base64");

    expect(() => decrypt(tampered)).toThrow();
  });
});
