import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import GiftCard from '../models/GiftCard';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/giftcards/validate — public (check balance)
router.post(
  '/validate',
  [body('code').notEmpty().withMessage('Gift card code required')],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const code = req.body.code.toUpperCase();
      const gc = await GiftCard.findOne({ code, isActive: true });

      if (!gc) {
        res.status(404).json({ message: 'Invalid gift card code' });
        return;
      }

      if (gc.expiresAt && new Date() > gc.expiresAt) {
        res.status(400).json({ message: 'Gift card has expired' });
        return;
      }

      res.json({
        valid: true,
        balance: gc.currentBalance,
        currency: gc.currency,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /api/giftcards/admin/all — admin/staff list
router.get('/admin/all', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [giftcards, total] = await Promise.all([
      GiftCard.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      GiftCard.countDocuments(),
    ]);

    res.json({ giftcards, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/giftcards — admin/staff create/issue new GC
router.post(
  '/',
  protect,
  staffOrAdmin,
  [
    body('initialBalance').isFloat({ min: 1 }).withMessage('Balance must be > 0'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { initialBalance, purchaserName, purchaserEmail, recipientName, recipientEmail, message, expiresAt } = req.body;

      // Generate a nice GC code
      const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = 'GC-';
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 4; j++) code += chars.charAt(Math.floor(Math.random() * chars.length));
          if (i < 2) code += '-';
        }
        return code;
      };

      const code = generateCode();

      const gc = await GiftCard.create({
        code,
        initialBalance,
        currentBalance: initialBalance,
        purchaserName,
        purchaserEmail,
        recipientName,
        recipientEmail,
        message,
        expiresAt,
      });

      res.status(201).json({ giftcard: gc });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/giftcards/:id/adjust — admin/staff manually adjust balance
router.put('/:id/adjust', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, type } = req.body; // type: 'add' | 'subtract' | 'set'
    
    const gc = await GiftCard.findById(req.params.id);
    if (!gc) {
      res.status(404).json({ message: 'Gift card not found' });
      return;
    }

    if (type === 'set') gc.currentBalance = amount;
    else if (type === 'add') gc.currentBalance += amount;
    else if (type === 'subtract') gc.currentBalance = Math.max(0, gc.currentBalance - amount);

    await gc.save();
    res.json({ giftcard: gc });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/giftcards/:id — admin/staff
router.delete('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await GiftCard.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gift card deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
