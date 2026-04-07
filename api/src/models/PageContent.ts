import mongoose, { Document, Schema } from 'mongoose';

export interface IPageContent extends Document {
  slug: string; // e.g. 'warranty', 'tos', 'privacy-policy', 'cookie-policy'
  title: string;
  content: string; // HTML or Markdown
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PageContentSchema = new Schema<IPageContent>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, default: '' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PageContentSchema.index({ slug: 1 });

export default mongoose.model<IPageContent>('PageContent', PageContentSchema);
