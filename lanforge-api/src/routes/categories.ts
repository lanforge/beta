import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Category from '../models/Category';
import Product from '../models/Product';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/categories — public
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const filter: any = {};
    if (!includeInactive) filter.isActive = true;

    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .populate('parentCategory', 'name slug');

    // Attach product counts
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat.slug, isActive: true });
        return { ...cat.toObject(), productCount: count };
      })
    );

    res.json({ categories: categoriesWithCounts });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/categories/:id — public
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
    }).populate('parentCategory', 'name slug');

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    const productCount = await Product.countDocuments({
      category: category.slug,
      isActive: true,
    });

    res.json({ category: { ...category.toObject(), productCount } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/categories — admin/staff
router.post(
  '/',
  protect,
  staffOrAdmin,
  [body('name').notEmpty().withMessage('Name is required')],
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

      const category = await Category.create({ ...req.body, slug });
      res.status(201).json({ category });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({ message: 'Category slug already exists' });
        return;
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/categories/:id — admin/staff
router.put('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ category });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category slug already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/categories/:id — admin/staff
router.delete('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Check if any products use this category
    const productCount = await Product.countDocuments({ category: category.slug });
    if (productCount > 0) {
      // Soft delete only
      await Category.findByIdAndUpdate(req.params.id, { isActive: false });
      res.json({ message: 'Category deactivated (has associated products)' });
      return;
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/categories/reorder — admin/staff
router.post('/reorder', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { order } = req.body; // Array of { id, sortOrder }
    await Promise.all(
      order.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
        Category.findByIdAndUpdate(id, { sortOrder })
      )
    );
    res.json({ message: 'Categories reordered' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;