import mongoose, { Document, Schema } from 'mongoose';

export interface IGiftCard extends Document {
  code: string; // e.g. GC-1A2B-3C4D-5E6F
  initialBalance: number;
  currentBalance: number;
  currency: string;
  purchaserName?: string;
  purchaserEmail?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GiftCardSchema = new Schema<IGiftCard>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    initialBalance: { type: Number, required: true, min: 0 },
    currentBalance: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    purchaserName: { type: String },
    purchaserEmail: { type: String, lowercase: true },
    recipientName: { type: String },
    recipientEmail: { type: String, lowercase: true },
    message: { type: String },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

GiftCardSchema.index({ code: 1 });
GiftCardSchema.index({ currentBalance: 1 });

export default mongoose.model<IGiftCard>('GiftCard', GiftCardSchema);
