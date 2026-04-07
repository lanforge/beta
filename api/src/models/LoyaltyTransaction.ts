import mongoose, { Document, Schema } from 'mongoose';

export interface ILoyaltyTransaction extends Document {
  customer: mongoose.Types.ObjectId;
  points: number;
  type: 'earn' | 'redeem' | 'bonus' | 'expire' | 'adjust';
  reason: string;
  orderId?: mongoose.Types.ObjectId;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}

const LoyaltyTransactionSchema = new Schema<ILoyaltyTransaction>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    points: { type: Number, required: true },
    type: {
      type: String,
      enum: ['earn', 'redeem', 'bonus', 'expire', 'adjust'],
      required: true,
    },
    reason: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

LoyaltyTransactionSchema.index({ customer: 1, createdAt: -1 });

export default mongoose.model<ILoyaltyTransaction>('LoyaltyTransaction', LoyaltyTransactionSchema);