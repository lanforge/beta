import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportTicket extends Document {
  ticketNumber: string; // e.g. TKT-12345
  customerName: string;
  customerEmail: string;
  customerId?: mongoose.Types.ObjectId; // if logged in
  orderId?: mongoose.Types.ObjectId; // if related to an order
  subject: string;
  message: string;
  category: 'warranty' | 'tech_support' | 'sales' | 'general' | 'return';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed';
  assignedTo?: mongoose.Types.ObjectId; // Staff/Admin User ID
  responses: {
    message: string;
    isStaff: boolean;
    authorName: string;
    createdAt: Date;
  }[];
  attachments: string[]; // array of URLs
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ['warranty', 'tech_support', 'sales', 'general', 'return'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed'],
      default: 'open',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    responses: [
      {
        message: { type: String, required: true },
        isStaff: { type: Boolean, required: true },
        authorName: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

SupportTicketSchema.index({ ticketNumber: 1 });
SupportTicketSchema.index({ customerEmail: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ category: 1 });
SupportTicketSchema.index({ assignedTo: 1 });
SupportTicketSchema.index({ createdAt: -1 });

export default mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
