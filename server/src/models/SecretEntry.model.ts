// src/models/SecretEntry.model.ts
import mongoose, { Document, Types } from 'mongoose';
import { EncryptedPayload } from '../utils/encryption.utils';

export interface ISecretEntry extends Document {
  ownerId: Types.ObjectId;
  name: string;
  provider?: string;
  type?: string;
  secret?: EncryptedPayload; // single secret (encrypted)
  fields?: Record<string, EncryptedPayload | string>; // multi-field, encrypted values or plain non-sensitive strings
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
}

const encryptedPayloadSchema = new mongoose.Schema(
  {
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    ciphertext: { type: String, required: true },
  },
  { _id: false }
);

const secretEntrySchema = new mongoose.Schema<ISecretEntry>(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    provider: { type: String },
    type: { type: String },
    secret: { type: encryptedPayloadSchema },
    fields: { type: Map, of: mongoose.Schema.Types.Mixed }, // values can be EncryptedPayload or plain strings
    description: { type: String },
    tags: { type: [String], default: [] },
    lastAccessedAt: { type: Date },
  },
  { timestamps: true }
);

// Helper to mask a secret payload (show first 4 and last 4 chars of ciphertext)
secretEntrySchema.methods.getMaskedSecret = function (): string | null {
  if (!this.secret) return null;
  const ct = this.secret.ciphertext;
  if (ct.length <= 8) return '****';
  return `${ct.slice(0, 4)}****${ct.slice(-4)}`;
};

export default mongoose.model<ISecretEntry>('SecretEntry', secretEntrySchema);
