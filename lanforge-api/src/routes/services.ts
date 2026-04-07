import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Service from '../models/Service';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/services — public list of active services
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string;
    const filter: any = { isActive: true };
    if (category) filter.category = category;

    const services = await Service.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/services/admin/all — admin/staff list
router.get('/admin/all', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const services = await Service.find().sort({ sortOrder: 1, name: 1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/services — admin/staff create
router.post(
  '/',
  protect,
  staffOrAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const slug =
        req.body.slug ||
        req.body.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const service = await Service.create({ ...req.body, slug });
      res.status(201).json({ service });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ message: 'Slug already exists' });
        return;
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/services/:id — admin/staff update
router.put('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    res.json({ service });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Slug already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/services/:id — admin/staff (soft delete)
router.delete('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!service) {
      res.status(404).json({ message: 'Service not found' });
      return;
    }
    res.json({ message: 'Service deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/services/reorder — admin/staff
router.post('/reorder', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { order } = req.body;
    await Promise.all(
      order.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
        Service.findByIdAndUpdate(id, { sortOrder })
      )
    );
    res.json({ message: 'Services reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
