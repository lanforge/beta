import mongoose, { Document, Schema } from 'mongoose';

export interface IAffiliateApplication extends Document {
  name: string;
  email: string;
  socialLinks: string[]; // Array of URLs (Twitch, YouTube, Twitter, etc)
  audienceSize: string; // e.g., '10k-50k', '50k+', etc
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string; // Internal staff notes
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateApplicationSchema = new Schema<IAffiliateApplication>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    socialLinks: [{ type: String }],
    audienceSize: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

AffiliateApplicationSchema.index({ status: 1 });
AffiliateApplicationSchema.index({ createdAt: -1 });

export default mongoose.model<IAffiliateApplication>('AffiliateApplication', AffiliateApplicationSchema);
