import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import PageContent from '../models/PageContent';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/pages/:slug — public endpoint to fetch page content
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = await PageContent.findOne({ slug: req.params.slug });
    if (!page) {
      // Rather than a 404, we can return a default empty structure so the frontend doesn't break
      res.json({
        page: {
          slug: req.params.slug,
          title: req.params.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          content: 'Content coming soon.',
        },
      });
      return;
    }
    res.json({ page });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/pages — admin/staff list all pages
router.get('/', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pages = await PageContent.find().select('slug title updatedAt').sort({ slug: 1 });
    res.json({ pages });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/pages/:slug — admin/staff update or create a page
router.put(
  '/:slug',
  protect,
  staffOrAdmin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { title, content } = req.body;
      const page = await PageContent.findOneAndUpdate(
        { slug: req.params.slug },
        { title, content, updatedBy: req.user?._id },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      res.json({ page });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/pages/:slug — admin delete
router.delete('/:slug', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await PageContent.findOneAndDelete({ slug: req.params.slug });
    res.json({ message: 'Page deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
