import mongoose, { Document, Schema } from 'mongoose';

export type AccessoryType =
  | 'keyboard'
  | 'mouse'
  | 'controller'
  | 'monitor'
  | 'headset'
  | 'mousepad'
  | 'chair'
  | 'desk'
  | 'cable'
  | 'other';

export interface IAccessory extends Document {
  type: AccessoryType;
  name: string;
  slug: string;
  brand: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  cost: number;
  stock: number;
  reserved: number;
  reorderPoint: number;
  serialNumbers: string[];
  specs: Record<string, string>;
  images: string[];
  description: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  ratings: { average: number; count: number };
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

const AccessorySchema = new Schema<IAccessory>(
  {
    type: {
      type: String,
      enum: ['keyboard', 'mouse', 'controller', 'monitor', 'headset', 'mousepad', 'chair', 'desk', 'cable', 'other'],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    brand: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    cost: { type: Number, required: true, min: 0, default: 0 },
    stock: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    reorderPoint: { type: Number, default: 5 },
    serialNumbers: [{ type: String }],
    specs: { type: Map, of: String, default: {} },
    images: [{ type: String }],
    description: { type: String, required: true, default: '' },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    weight: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AccessorySchema.index({ serialNumbers: 1 }, { unique: true, partialFilterExpression: { serialNumbers: { $exists: true, $type: 'array', $ne: [] } } });
AccessorySchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });
AccessorySchema.index({ type: 1, isActive: 1 });
AccessorySchema.index({ slug: 1 });

export default mongoose.model<IAccessory>('Accessory', AccessorySchema);
