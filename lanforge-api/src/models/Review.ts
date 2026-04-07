import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  product?: mongoose.Types.ObjectId;
  pcPart?: mongoose.Types.ObjectId;
  accessory?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean; // Requires admin approval to show on site
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    pcPart: { type: Schema.Types.ObjectId, ref: 'PCPart' },
    accessory: { type: Schema.Types.ObjectId, ref: 'Accessory' },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, isApproved: 1 });
ReviewSchema.index({ pcPart: 1, isApproved: 1 });
ReviewSchema.index({ accessory: 1, isApproved: 1 });
ReviewSchema.index({ createdAt: -1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
