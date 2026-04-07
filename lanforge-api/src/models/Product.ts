import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  cost: number;
  sku: string;
  category: string;
  subcategory?: string;
  images: string[];
  stock: number;
  reserved: number;
  reorderPoint: number;
  reorderQty: number;
  location: string;
  serialNumbers: string[];
  specs: Record<string, string>;
  parts?: mongoose.Types.ObjectId[]; // References to PCPart model
  services?: mongoose.Types.ObjectId[]; // References to Service model
  laborFee?: number;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  weight: number;
  ratings: { average: number; count: number };
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    cost: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true },
    category: { type: String, required: true },
    subcategory: { type: String },
    images: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    reorderPoint: { type: Number, default: 5 },
    reorderQty: { type: Number, default: 10 },
    location: { type: String, default: '' },
    serialNumbers: [{ type: String }],
    specs: { type: Map, of: String, default: {} },
    parts: [{ type: Schema.Types.ObjectId, ref: 'PCPart' }],
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    laborFee: { type: Number, default: 0, min: 0 },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    weight: { type: Number, default: 0 },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

ProductSchema.index({ serialNumbers: 1 }, { unique: true, partialFilterExpression: { serialNumbers: { $exists: true, $type: 'array', $ne: [] } } });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ slug: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);