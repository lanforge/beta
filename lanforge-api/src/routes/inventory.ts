import { Router, Response } from 'express';
import Product from '../models/Product';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/inventory — admin/staff: full inventory list with stock levels
router.get('/', protect, staffOrAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ isActive: true })
      .select('name sku serialNumbers category stock reserved reorderPoint reorderQty location cost price images')
      .sort({ stock: 1 });

    const totalItems = products.length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock - p.reserved <= p.reorderPoint && p.stock > 0).length;
    const totalValue = products.reduce((sum, p) => sum + p.stock * p.cost, 0);

    res.json({ products, stats: { totalItems, outOfStock, lowStock, totalValue } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/inventory/low-stock — admin/staff
router.get('/low-stock', protect, staffOrAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: [{ $subtract: ['$stock', '$reserved'] }, '$reorderPoint'] },
    })
      .select('name sku serialNumbers category stock reserved reorderPoint reorderQty location images')
      .sort({ stock: 1 });

    res.json({ products, count: products.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/inventory/out-of-stock — admin/staff
router.get('/out-of-stock', protect, staffOrAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ isActive: true, stock: 0 })
      .select('name sku serialNumbers category stock reserved reorderPoint location images')
      .sort({ name: 1 });

    res.json({ products, count: products.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/inventory/:productId — admin/staff: single product stock detail
router.get('/:productId', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.productId).select(
      'name sku serialNumbers category stock reserved reorderPoint reorderQty location cost price images'
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ product, available: product.stock - product.reserved });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/inventory/:productId/stock — admin/staff: adjust stock
router.put('/:productId/stock', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, quantity, notes } = req.body;

    if (!['set', 'add', 'remove'].includes(type) || typeof quantity !== 'number' || quantity < 0) {
      res.status(400).json({ message: 'Invalid adjustment: type must be set/add/remove, quantity must be >= 0' });
      return;
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const prevStock = product.stock;

    if (type === 'set') product.stock = quantity;
    else if (type === 'add') product.stock += quantity;
    else if (type === 'remove') product.stock = Math.max(0, product.stock - quantity);

    await product.save();

    try {
      const AuditLog = (await import('../models/AuditLog')).default;
      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email,
        action: 'update_inventory',
        resource: 'product',
        resourceId: String(product._id),
        details: { type, quantity, notes, prevStock, newStock: product.stock },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'success',
      });
    } catch (e) {}

    res.json({
      product,
      adjustment: { type, quantity, notes, prevStock, newStock: product.stock, by: req.user?.email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/inventory/bulk/adjust — admin/staff: bulk stock adjustment
router.post('/bulk/adjust', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adjustments: Array<{ productId: string; type: string; quantity: number }> = req.body.adjustments;

    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      res.status(400).json({ message: 'No adjustments provided' });
      return;
    }

    const results: Array<{ productId: string; status: string; newStock?: number; error?: string }> = [];

    for (const adj of adjustments) {
      try {
        const product = await Product.findById(adj.productId);
        if (!product) {
          results.push({ productId: adj.productId, status: 'not_found' });
          continue;
        }

        const prevStock = product.stock;
        if (adj.type === 'set') product.stock = adj.quantity;
        else if (adj.type === 'add') product.stock += adj.quantity;
        else if (adj.type === 'remove') product.stock = Math.max(0, product.stock - adj.quantity);

        await product.save();
        
        try {
          const AuditLog = (await import('../models/AuditLog')).default;
          await AuditLog.create({
            userId: req.user?._id,
            userEmail: req.user?.email,
            action: 'update_inventory',
            resource: 'product',
            resourceId: String(product._id),
            details: { type: adj.type, quantity: adj.quantity, prevStock, newStock: product.stock },
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            status: 'success',
          });
        } catch (e) {}
        
        results.push({ productId: adj.productId, status: 'ok', newStock: product.stock });
      } catch (e) {
        results.push({ productId: adj.productId, status: 'error', error: String(e) });
      }
    }

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/inventory/:productId/serial-numbers — admin/staff
router.put('/:productId/serial-numbers', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serialNumbers } = req.body;
    if (!Array.isArray(serialNumbers)) {
      res.status(400).json({ message: 'serialNumbers must be an array of strings' });
      return;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { serialNumbers },
      { new: true }
    ).select('name sku serialNumbers stock');

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'One or more serial numbers are already in use' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/inventory/:productId/location — admin/staff
router.put('/:productId/location', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { location } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { location },
      { new: true }
    ).select('name sku location');

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/inventory/:productId/reorder-settings — admin/staff
router.put('/:productId/reorder-settings', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reorderPoint, reorderQty } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { reorderPoint, reorderQty },
      { new: true }
    ).select('name sku reorderPoint reorderQty stock');

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;