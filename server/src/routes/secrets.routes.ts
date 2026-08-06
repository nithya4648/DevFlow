// src/routes/secrets.routes.ts
import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import SecretEntry from '../models/SecretEntry.model';
import { encrypt, decrypt, EncryptedPayload } from '../utils/encryption.utils';
import { createSecretSchema, updateSecretSchema } from '../validators/secret.validators';
import rateLimiter from '../utils/rateLimiter';
import AccessLog from '../models/AccessLog.model';

const router = Router();

// Helper to mask encrypted payload
function maskPayload(payload: EncryptedPayload): string {
  const ct = payload.ciphertext;
  if (ct.length <= 8) return '****';
  return `${ct.slice(0, 4)}****${ct.slice(-4)}`;
}

// List all secrets for the authenticated user – masked
router.get('/', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const secrets = await SecretEntry.find({ ownerId: userId }).select('-fields -secret');
  const masked = secrets.map((s) => ({
    _id: s._id,
    name: s.name,
    provider: s.provider,
    type: s.type,
    description: s.description,
    tags: s.tags,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
    lastAccessedAt: s.lastAccessedAt,
    maskedSecret: s.secret ? maskPayload(s.secret as any) : null,
  }));
  res.json(masked);
});

// Create a new secret entry
router.post('/', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const parseResult = createSecretSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.format() });
  }
  const { name, provider, type, secret, fields, description, tags } = parseResult.data;

  // Encrypt secret if provided
  const encryptedSecret = secret ? encrypt(secret) : undefined;
  // Encrypt each sensitive field
  const encryptedFields: Record<string, EncryptedPayload | string> = {};
  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      if (value.sensitive) {
        encryptedFields[key] = encrypt(value.value);
      } else {
        encryptedFields[key] = value.value; // plain non‑sensitive
      }
    }
  }

  const newEntry = await SecretEntry.create({
    ownerId: userId,
    name,
    provider,
    type,
    secret: encryptedSecret,
    fields: encryptedFields,
    description,
    tags,
  });
  res.status(201).json({ message: 'Secret created', id: newEntry._id });
});

// Reveal a secret (full decryption) – rate limited
router.get('/:id/reveal', authenticate, rateLimiter({ windowMs: 60 * 1000, max: 5 }), async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { id } = req.params;
  const secret = await SecretEntry.findOne({ _id: id, ownerId: userId });
  if (!secret) return res.status(404).json({ message: 'Secret not found' });

  // Decrypt single secret if present
  let decryptedSecret: string | undefined;
  if (secret.secret) decryptedSecret = decrypt(secret.secret as any);

  // Decrypt fields
  const decryptedFields: Record<string, string> = {};
  if (secret.fields) {
    for (const [key, val] of secret.fields.entries()) {
      if (typeof val === 'object' && val !== null && 'ciphertext' in val) {
        decryptedFields[key] = decrypt(val as any);
      } else {
        decryptedFields[key] = val as string; // plain non‑sensitive
      }
    }
  }

  // Log access
  await AccessLog.create({
    userId,
    secretId: secret._id,
    accessedAt: new Date(),
    ip: req.ip,
  });

  res.json({
    id: secret._id,
    name: secret.name,
    provider: secret.provider,
    type: secret.type,
    secret: decryptedSecret,
    fields: decryptedFields,
    description: secret.description,
    tags: secret.tags,
    createdAt: secret.createdAt,
    updatedAt: secret.updatedAt,
    lastAccessedAt: secret.lastAccessedAt,
  });
});

// Update secret metadata or rotate values
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { id } = req.params;
  const parseResult = updateSecretSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.format() });
  }
  const updateData = parseResult.data;

  const secret = await SecretEntry.findOne({ _id: id, ownerId: userId });
  if (!secret) return res.status(404).json({ message: 'Secret not found' });

  // Update fields safely – encrypt if needed
  if (updateData.secret) {
    secret.secret = encrypt(updateData.secret);
  }
  if (updateData.fields) {
    for (const [key, val] of Object.entries(updateData.fields)) {
      if (val.sensitive) {
        secret.fields!.set(key, encrypt(val.value));
      } else {
        secret.fields!.set(key, val.value);
      }
    }
  }
  // other simple updates
  if (updateData.name) secret.name = updateData.name;
  if (updateData.provider) secret.provider = updateData.provider;
  if (updateData.type) secret.type = updateData.type;
  if (updateData.description) secret.description = updateData.description;
  if (updateData.tags) secret.tags = updateData.tags;

  await secret.save();
  res.json({ message: 'Secret updated' });
});

// Delete a secret
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { id } = req.params;
  const result = await SecretEntry.deleteOne({ _id: id, ownerId: userId });
  if (result.deletedCount === 0) return res.status(404).json({ message: 'Secret not found' });
  res.json({ message: 'Secret deleted' });
});

export default router;
