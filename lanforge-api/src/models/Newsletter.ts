import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  isActive: boolean;
  unsubscribedAt?: Date;
  source: string; // e.g. 'footer', 'checkout'
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
    unsubscribedAt: { type: Date },
    source: { type: String, default: 'unknown' },
  },
  { timestamps: true }
);

NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ isActive: 1 });

export default mongoose.model<INewsletter>('Newsletter', NewsletterSchema);
