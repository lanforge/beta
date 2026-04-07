import mongoose, { Document, Schema } from 'mongoose';

export interface IRMA extends Document {
  rmaNumber: string; // e.g. RMA-12345
  order: mongoose.Types.ObjectId;
  customer?: mongoose.Types.ObjectId;
  guestEmail?: string;
  items: {
    product?: mongoose.Types.ObjectId;
    pcPart?: mongoose.Types.ObjectId;
    accessory?: mongoose.Types.ObjectId;
    customBuild?: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    serialNumbers?: string[];
    reason: string;
  }[];
  status: 'requested' | 'approved' | 'received' | 'inspecting' | 'refunded' | 'rejected';
  returnShippingTracking?: string;
  refundAmount?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RMAItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    pcPart: { type: Schema.Types.ObjectId, ref: 'PCPart' },
    accessory: { type: Schema.Types.ObjectId, ref: 'Accessory' },
    customBuild: { type: Schema.Types.ObjectId, ref: 'CustomBuild' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    serialNumbers: [{ type: String }],
    reason: { type: String, required: true },
  },
  { _id: false }
);

const RMASchema = new Schema<IRMA>(
  {
    rmaNumber: { type: String, required: true, unique: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    guestEmail: { type: String },
    items: [RMAItemSchema],
    status: {
      type: String,
      enum: ['requested', 'approved', 'received', 'inspecting', 'refunded', 'rejected'],
      default: 'requested',
    },
    returnShippingTracking: { type: String },
    refundAmount: { type: Number, default: 0, min: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

RMASchema.index({ rmaNumber: 1 });
RMASchema.index({ order: 1 });
RMASchema.index({ status: 1 });
RMASchema.index({ customer: 1 });

export default mongoose.model<IRMA>('RMA', RMASchema);
