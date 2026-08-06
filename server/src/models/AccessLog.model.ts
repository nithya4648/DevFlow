// src/models/AccessLog.model.ts
import mongoose, { Document, Types } from 'mongoose';

export interface IAccessLog extends Document {
  userId: Types.ObjectId;
  secretId: Types.ObjectId;
  accessedAt: Date;
  ip: string;
}

const accessLogSchema = new mongoose.Schema<IAccessLog>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    secretId: { type: mongoose.Schema.Types.ObjectId, ref: 'SecretEntry', required: true },
    accessedAt: { type: Date, default: Date.now },
    ip: { type: String },
  },
  { timestamps: false }
);

export default mongoose.model<IAccessLog>('AccessLog', accessLogSchema);
