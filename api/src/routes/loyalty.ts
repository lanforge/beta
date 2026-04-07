import { Router, Response } from 'express';
import Customer from '../models/Customer';
import LoyaltyTransaction from '../models/LoyaltyTransaction';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/loyalty/members
router.get('/members', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tier = req.query.tier as string;
    const search = req.query.search as string;

    const filter: any = {};
    if (tier && tier !== 'all') filter.loyaltyTier = tier;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await Customer.find(filter)
      .sort({ loyaltyPoints: -1 })
      .select('firstName lastName email loyaltyPoints loyaltyTier totalSpent createdAt');

    const tierStats = {
      Bronze: await Customer.countDocuments({ loyaltyTier: 'Bronze' }),
      Silver: await Customer.countDocuments({ loyaltyTier: 'Silver' }),
      Gold: await Customer.countDocuments({ loyaltyTier: 'Gold' }),
      Platinum: await Customer.countDocuments({ loyaltyTier: 'Platinum' }),
    };

    res.json({ members, tierStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/loyalty/transactions/:customerId
router.get('/transactions/:customerId', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transactions = await LoyaltyTransaction.find({ customer: req.params.customerId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;