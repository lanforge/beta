import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  cost: number;
  icon?: string;
  category: string; // e.g. 'Build', 'Warranty', 'Tuning'
  isMandatory: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0, default: 0 },
    icon: { type: String },
    category: { type: String, required: true, default: 'General' },
    isMandatory: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ServiceSchema.index({ isActive: 1, sortOrder: 1 });
ServiceSchema.index({ slug: 1 });
ServiceSchema.index({ category: 1 });

export default mongoose.model<IService>('Service', ServiceSchema);
