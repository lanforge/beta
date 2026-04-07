import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import FAQ from '../models/FAQ';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/faqs — public
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string;
    const filter: any = { isActive: true };
    if (category) filter.category = category;

    const faqs = await FAQ.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ faqs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/faqs/admin/all — admin/staff list all
router.get('/admin/all', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const faqs = await FAQ.find().sort({ category: 1, sortOrder: 1, createdAt: -1 });
    res.json({ faqs });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/faqs — admin/staff
router.post(
  '/',
  protect,
  staffOrAdmin,
  [
    body('question').notEmpty().withMessage('Question is required'),
    body('answer').notEmpty().withMessage('Answer is required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const faq = await FAQ.create(req.body);
      res.status(201).json({ faq });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/faqs/:id — admin/staff
router.put('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) {
      res.status(404).json({ message: 'FAQ not found' });
      return;
    }
    res.json({ faq });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/faqs/:id — admin/staff
router.delete('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      res.status(404).json({ message: 'FAQ not found' });
      return;
    }
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/faqs/reorder — admin/staff
router.post('/reorder', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { order } = req.body; // Array of { id, sortOrder }
    await Promise.all(
      order.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
        FAQ.findByIdAndUpdate(id, { sortOrder })
      )
    );
    res.json({ message: 'FAQs reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
