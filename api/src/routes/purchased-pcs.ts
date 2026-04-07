// API route to get purchased PCs by order ID
import { Router, Request, Response } from 'express';
import PurchasedPC from '../models/PurchasedPC';
import { protect, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/purchased-pcs/order/:orderId — admin/staff: view all purchased PCs for an order
router.get('/order/:orderId', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pcs = await PurchasedPC.find({ order: req.params.orderId })
      .populate('order', 'orderNumber status')
      .populate('customer', 'firstName lastName email')
      .populate('product', 'name sku')
      .populate('customBuild', 'name buildId')
      .sort({ createdAt: -1 });
    
    res.json({ pcs });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching purchased PCs for order' });
  }
});

// GET /api/purchased-pcs — admin/staff: view all purchased PCs
router.get('/', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pcs = await PurchasedPC.find()
      .populate('order', 'orderNumber status')
      .populate('customer', 'firstName lastName email')
      .populate('product', 'name sku')
      .populate('customBuild', 'name buildId')
      .sort({ createdAt: -1 });
    
    res.json({ pcs });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching purchased PCs' });
  }
});

// GET /api/purchased-pcs/:id — admin/staff: view a specific purchased PC
router.get('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pc = await PurchasedPC.findById(req.params.id)
      .populate('order', 'orderNumber status')
      .populate('customer', 'firstName lastName email')
      .populate('product', 'name sku')
      .populate('customBuild', 'name buildId');
    
    if (!pc) {
      res.status(404).json({ message: 'Purchased PC not found' });
      return;
    }
    
    res.json({ pc });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching purchased PC' });
  }
});

// PUT /api/purchased-pcs/:id — admin/staff: update status or notes
router.put('/:id', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, notes } = req.body;
    
    const pc = await PurchasedPC.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    
    if (!pc) {
      res.status(404).json({ message: 'Purchased PC not found' });
      return;
    }
    
    res.json({ pc });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating purchased PC' });
  }
});

export default router;