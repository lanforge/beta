import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailCampaign extends Document {
  name: string;
  subject: string;
  body: string;
  type: 'promotional' | 'newsletter' | 'abandoned_cart' | 'welcome' | 'reengagement';
  status: 'draft' | 'scheduled' | 'sending' | 'sent';
  recipients: number;
  openCount: number;
  clickCount: number;
  scheduledAt?: Date;
  sentAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailCampaignSchema = new Schema<IEmailCampaign>(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, default: '' },
    type: {
      type: String,
      enum: ['promotional', 'newsletter', 'abandoned_cart', 'welcome', 'reengagement'],
      default: 'promotional',
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sending', 'sent'],
      default: 'draft',
    },
    recipients: { type: Number, default: 0 },
    openCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IEmailCampaign>('EmailCampaign', EmailCampaignSchema);