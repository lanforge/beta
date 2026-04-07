import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import EmailCampaign from '../models/EmailCampaign';
import Customer from '../models/Customer';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';
import { sendCampaignEmail } from '../services/emailService';

const router = Router();

// GET /api/email/campaigns
router.get('/campaigns', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await EmailCampaign.find().sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/email/campaigns
router.post(
  '/campaigns',
  protect,
  staffOrAdmin,
  [
    body('name').notEmpty(),
    body('subject').notEmpty(),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    try {
      const campaign = await EmailCampaign.create({
        ...req.body,
        createdBy: req.user?._id,
      });
      res.status(201).json({ campaign });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/email/campaigns/:id
router.put('/campaigns/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await EmailCampaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }
    res.json({ campaign });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/email/campaigns/:id/send
router.post('/campaigns/:id/send', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaign = await EmailCampaign.findById(req.params.id);
    if (!campaign) {
      res.status(404).json({ message: 'Campaign not found' });
      return;
    }

    if (campaign.status === 'sent') {
      res.status(400).json({ message: 'Campaign already sent' });
      return;
    }

    // Get opted-in customer emails
    const customers = await Customer.find({ marketingOptIn: true, isActive: true }).select('email');
    const emails = customers.map((c) => c.email);

    if (emails.length === 0) {
      res.status(400).json({ message: 'No opted-in customers found' });
      return;
    }

    // Mark as sending
    campaign.status = 'sending';
    await campaign.save();

    // Send async
    sendCampaignEmail(emails, campaign.subject, campaign.body, campaign.subject)
      .then(async () => {
        campaign.status = 'sent';
        campaign.sentAt = new Date();
        campaign.recipients = emails.length;
        await campaign.save();
      })
      .catch(async (err) => {
        console.error('Campaign send error:', err);
        campaign.status = 'draft';
        await campaign.save();
      });

    res.json({ message: `Sending to ${emails.length} recipients`, campaign });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/email/campaigns/:id
router.delete('/campaigns/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await EmailCampaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;