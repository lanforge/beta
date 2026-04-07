import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Accessory, { AccessoryType } from '../models/Accessory';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const VALID_TYPES: AccessoryType[] = [
  'keyboard', 'mouse', 'controller', 'monitor', 'headset', 'mousepad', 'chair', 'desk', 'cable', 'other'
];

// ─── FRONTEND ROUTES ─────────────────────────────────────────────────────────

// GET /api/accessories — public, paginated, filterable
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;
    const skip = (page - 1) * limit;

    const type = req.query.type as AccessoryType;
    const brand = req.query.brand as string;
    const search = req.query.search as string;
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const inStock = req.query.inStock === 'true';
    const featured = req.query.featured === 'true';
    const tag = req.query.tag as string;

    const filter: any = { isActive: true };
    if (type && VALID_TYPES.includes(type)) filter.type = type;
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (featured) filter.isFeatured = true;
    if (tag) filter.tags = tag;
    if (inStock) filter.$expr = { $gt: [{ $subtract: ['$stock', '$reserved'] }, 0] };
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }
    if (search) {
      filter.$text = { $search: search };
    }

    const sortObj: any = {};
    sortObj[sortBy] = order;

    const [accessories, total] = await Promise.all([
      Accessory.find(filter)
        .select('-cost -reserved -reorderPoint -serialNumbers')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Accessory.countDocuments(filter),
    ]);

    res.json({ accessories, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/accessories/types — public: list of available types with counts
router.get('/types', async (_req: Request, res: Response): Promise<void> => {
  try {
    const counts = await Accessory.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ types: counts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/accessories/featured — public
router.get('/featured', async (_req: Request, res: Response): Promise<void> => {
  try {
    const accessories = await Accessory.find({ isActive: true, isFeatured: true })
      .select('-cost -reserved -reorderPoint -serialNumbers')
      .sort({ 'ratings.average': -1 })
      .limit(12);
    res.json({ accessories });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/accessories/:id — public (by id or slug)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const accessory = await Accessory.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      isActive: true,
    }).select('-cost -reserved -reorderPoint -serialNumbers');

    if (!accessory) {
      res.status(404).json({ message: 'Accessory not found' });
      return;
    }

    // Get related accessories (same type)
    const related = await Accessory.find({
      type: accessory.type,
      _id: { $ne: accessory._id },
      isActive: true,
    })
      .select('name slug price compareAtPrice images ratings stock type')
      .limit(4);

    res.json({ accessory, related });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// GET /api/accessories/admin/all — admin/staff, includes cost and stock
router.get('/admin/all', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const type = req.query.type as AccessoryType;
    const search = req.query.search as string;

    const filter: any = {};
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const [accessories, total] = await Promise.all([
      Accessory.find(filter).sort({ type: 1, brand: 1, name: 1 }).skip(skip).limit(limit),
      Accessory.countDocuments(filter),
    ]);

    res.json({ accessories, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/accessories — admin/staff
router.post(
  '/',
  protect,
  staffOrAdmin,
  [
    body('type').isIn(VALID_TYPES).withMessage(`Type must be one of: ${VALID_TYPES.join(', ')}`),
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('brand').notEmpty().withMessage('Brand is required'),
    body('description').notEmpty().withMessage('Description is required'),
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

      const accessory = await Accessory.create({ ...req.body, slug });
      res.status(201).json({ accessory });
    } catch (error: any) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern ?? {})[0] ?? 'field';
        res.status(400).json({ message: `${field} already exists` });
        return;
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/accessories/:id — admin/staff
router.put('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const accessory = await Accessory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!accessory) {
      res.status(404).json({ message: 'Accessory not found' });
      return;
    }
    res.json({ accessory });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'SKU or slug already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/accessories/:id — admin/staff (soft delete)
router.delete('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const accessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!accessory) {
      res.status(404).json({ message: 'Accessory not found' });
      return;
    }
    res.json({ message: 'Accessory deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/accessories/:id/serial-numbers — admin/staff
router.put('/:id/serial-numbers', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serialNumbers } = req.body;
    if (!Array.isArray(serialNumbers)) {
      res.status(400).json({ message: 'serialNumbers must be an array of strings' });
      return;
    }

    const accessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      { serialNumbers },
      { new: true }
    ).select('name sku serialNumbers stock');

    if (!accessory) {
      res.status(404).json({ message: 'Accessory not found' });
      return;
    }

    res.json({ accessory });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'One or more serial numbers are already in use' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/accessories/:id/stock — admin/staff: quick stock update
router.patch('/:id/stock', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, quantity } = req.body;
    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) {
      res.status(404).json({ message: 'Accessory not found' });
      return;
    }

    if (type === 'set') accessory.stock = quantity;
    else if (type === 'add') accessory.stock += quantity;
    else if (type === 'remove') accessory.stock = Math.max(0, accessory.stock - quantity);
    else {
      res.status(400).json({ message: 'type must be set, add, or remove' });
      return;
    }

    await accessory.save();
    res.json({ accessory });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/accessories/bulk/update — admin/staff bulk operations
router.post('/bulk/update', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ids, update } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'No accessory IDs provided' });
      return;
    }

    const result = await Accessory.updateMany({ _id: { $in: ids } }, update);
    res.json({ message: `Updated ${result.modifiedCount} accessories`, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/accessories/bulk/delete — admin/staff bulk deactivate
router.post('/bulk/delete', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'No accessory IDs provided' });
      return;
    }

    await Accessory.updateMany({ _id: { $in: ids } }, { isActive: false });
    res.json({ message: `Deactivated ${ids.length} accessories` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
