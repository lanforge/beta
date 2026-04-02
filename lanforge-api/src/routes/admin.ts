import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import Order from '../models/Order';
import Customer from '../models/Customer';
import Product from '../models/Product';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import Settings from '../models/Settings';
import { protect, adminOnly, staffOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

// GET /api/admin/dashboard
router.get('/dashboard', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalOrders,
      monthOrders,
      lastMonthOrders,
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      totalCustomers,
      newCustomers,
      totalProducts,
      lowStockProducts,
      pendingOrders,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.countDocuments({ paymentStatus: 'paid', createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({
        paymentStatus: 'paid',
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({
        isActive: true,
        $expr: { $lte: [{ $subtract: ['$stock', '$reserved'] }, '$reorderPoint'] },
      }),
      Order.countDocuments({ status: 'order-confirmed' }),
      Order.find({ paymentStatus: 'paid' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'firstName lastName email'),
    ]);

    const thisMonthRev = monthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth =
      lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;
    const orderGrowth =
      lastMonthOrders > 0 ? ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;

    res.json({
      stats: {
        totalOrders,
        monthOrders,
        orderGrowth: orderGrowth.toFixed(1),
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: thisMonthRev,
        revenueGrowth: revenueGrowth.toFixed(1),
        totalCustomers,
        newCustomers,
        totalProducts,
        lowStockProducts,
        pendingOrders,
      },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

// GET /api/admin/analytics?period=7d|30d|90d|1y
router.get('/analytics', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '30d';
    const now = new Date();
    let startDate: Date;
    let groupFormat: string;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        groupFormat = '%Y-%m';
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = '%Y-%m-%d';
    }

    const [
      revenueOverTime,
      orderStatusBreakdown,
      topProducts,
      customerGrowth,
      categoryRevenue,
      avgOrderValue,
    ] = await Promise.all([
      // Revenue and order count over time
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Order status breakdown
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Top 10 products by revenue
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            name: { $first: '$items.name' },
            sku: { $first: '$items.sku' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            unitsSold: { $sum: '$items.quantity' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),

      // Customer growth over time
      Customer.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            newCustomers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Revenue by category
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productInfo',
          },
        },
        { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$productInfo.category',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            units: { $sum: '$items.quantity' },
          },
        },
        { $sort: { revenue: -1 } },
      ]),

      // Average order value summary
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            avgOrderValue: { $avg: '$total' },
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      period,
      revenueOverTime,
      orderStatusBreakdown,
      topProducts,
      customerGrowth,
      categoryRevenue,
      summary: avgOrderValue[0] || { avgOrderValue: 0, totalRevenue: 0, totalOrders: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── REPORTS ─────────────────────────────────────────────────────────────────

// GET /api/admin/reports/sales?from=&to=
router.get('/reports/sales', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const from = req.query.from
      ? new Date(req.query.from as string)
      : new Date(new Date().getFullYear(), 0, 1);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();

    const [summary, byDay, byPaymentMethod] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' },
            totalDiscount: { $sum: '$discount' },
            totalShipping: { $sum: '$shipping' },
            totalTax: { $sum: '$tax' },
          },
        },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: from, $lte: to } } },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
    ]);

    res.json({ from, to, summary: summary[0] || {}, byDay, byPaymentMethod });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/reports/inventory
router.get('/reports/inventory', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [products, categoryBreakdown, lowStockItems] = await Promise.all([
      Product.find({ isActive: true }).sort({ stock: 1 }),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$category',
            totalItems: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            totalValue: { $sum: { $multiply: ['$stock', '$cost'] } },
          },
        },
        { $sort: { totalValue: -1 } },
      ]),
      Product.find({
        isActive: true,
        $expr: { $lte: [{ $subtract: ['$stock', '$reserved'] }, '$reorderPoint'] },
      }).select('name sku stock reserved reorderPoint category'),
    ]);

    const totalValue = products.reduce((sum, p) => sum + p.stock * p.cost, 0);

    res.json({
      totalProducts: products.length,
      totalValue,
      lowStockCount: lowStockItems.length,
      outOfStockCount: products.filter((p) => p.stock === 0).length,
      categoryBreakdown,
      lowStockItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/reports/customers
router.get('/reports/customers', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [tierBreakdown, topCustomers, retentionData, totalCustomers, activeCustomers] =
      await Promise.all([
        Customer.aggregate([
          {
            $group: {
              _id: '$loyaltyTier',
              count: { $sum: 1 },
              totalSpent: { $sum: '$totalSpent' },
            },
          },
        ]),
        Customer.find({ totalOrders: { $gt: 0 } })
          .sort({ totalSpent: -1 })
          .limit(20)
          .select('firstName lastName email loyaltyTier totalSpent totalOrders loyaltyPoints'),
        Customer.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              newCustomers: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
          { $limit: 12 },
        ]),
        Customer.countDocuments(),
        Customer.countDocuments({ totalOrders: { $gt: 0 } }),
      ]);

    res.json({ totalCustomers, activeCustomers, tierBreakdown, topCustomers, retentionData });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const filter: any = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/users
router.post(
  '/users',
  protect,
  adminOnly,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('role').isIn(['admin', 'staff']).withMessage('Role must be admin or staff'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    // Basic pre-validation to stop pre-hashed string bypass attempts in payload
    if (req.body.password && (req.body.password.startsWith('$2a$') || req.body.password.startsWith('$2b$') || req.body.password.startsWith('$2y$')) && req.body.password.length === 60) {
      res.status(400).json({ errors: [{ msg: 'Invalid password format. Cannot use a pre-hashed string.' }] });
      return;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { name, email, password, role } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        res.status(400).json({ message: 'Email already registered' });
        return;
      }

      const user = await User.create({ name, email, password, role });

      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email,
        action: 'create_user',
        resource: 'user',
        resourceId: String(user._id),
        details: { name, email, role },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'success',
      });

      res.status(201).json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/admin/users/:id
router.put('/users/:id', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // If role is being changed, let's track the old role
    const oldUser = await User.findById(req.params.id);
    if (!oldUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const allowedFields = ['name', 'role', 'isActive', 'avatar'];
    const updates: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // Don't allow self-demotion
    if (String(req.user?._id) === req.params.id && updates.role && updates.role !== 'admin') {
      res.status(400).json({ message: 'Cannot change your own role' });
      return;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isRoleChange = updates.role && updates.role !== oldUser.role;

    await AuditLog.create({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: isRoleChange ? 'change_user_role' : 'update_user',
      resource: 'user',
      resourceId: String(user._id),
      details: { ...updates, oldRole: isRoleChange ? oldUser.role : undefined },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id (soft delete — deactivate)
router.delete('/users/:id', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (String(req.user?._id) === req.params.id) {
      res.status(400).json({ message: 'Cannot delete your own account' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await AuditLog.create({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: 'deactivate_user',
      resource: 'user',
      resourceId: String(user._id),
      details: { email: user.email },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({ message: 'User deactivated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/users/:id/reset-password
router.post(
  '/users/:id/reset-password',
  protect,
  adminOnly,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { newPassword } = req.body;
      
      // Prevent pre-hashed string bypass in payload
      if (newPassword && (newPassword.startsWith('$2a$') || newPassword.startsWith('$2b$') || newPassword.startsWith('$2y$')) && newPassword.length === 60) {
        res.status(400).json({ message: 'Invalid password format. Cannot use a pre-hashed string.' });
        return;
      }

      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!newPassword || !passRegex.test(newPassword)) {
        res.status(400).json({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
        return;
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      const user = await User.findByIdAndUpdate(req.params.id, { password: hashed }).select(
        '-password'
      );

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email,
        action: 'reset_password',
        resource: 'user',
        resourceId: String(user._id),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'success',
      });

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = [
  { key: 'storeName', value: 'LANForge', category: 'general' },
  { key: 'storeEmail', value: process.env.ADMIN_EMAIL || 'admin@lanforge.com', category: 'general' },
  { key: 'storePhone', value: '', category: 'general' },
  { key: 'storeAddress', value: '', category: 'general' },
  { key: 'currency', value: 'USD', category: 'general' },
  { key: 'taxRate', value: 0.08, category: 'tax' },
  { key: 'taxEnabled', value: true, category: 'tax' },
  { key: 'freeShippingThreshold', value: 500, category: 'shipping' },
  { key: 'flatShippingRate', value: 29.99, category: 'shipping' },
  { key: 'orderNotifications', value: true, category: 'email' },
  { key: 'lowStockNotifications', value: true, category: 'email' },
  { key: 'lowStockThreshold', value: 5, category: 'general' },
  { key: 'maintenanceMode', value: false, category: 'general' },
  { key: 'sessionTimeout', value: 60, category: 'security' },
  { key: 'twoFactorEnabled', value: false, category: 'security' },
];

// GET /api/admin/settings
router.get('/settings', protect, staffOrAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string;
    const filter: any = {};
    if (category) filter.category = category;

    let settings = await Settings.find(filter);

    // Seed defaults if no settings exist
    if (settings.length === 0) {
      const toSeed = category
        ? DEFAULT_SETTINGS.filter((s) => s.category === category)
        : DEFAULT_SETTINGS;
      await Settings.insertMany(toSeed.map((s) => ({ ...s })));
      settings = await Settings.find(filter);
    }

    // Convert to key-value map
    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    res.json({ settings: settingsMap, raw: settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/settings
router.put('/settings', protect, adminOnly, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updates = req.body as Record<string, any>;
    const updatedKeys: string[] = [];

    await Promise.all(
      Object.entries(updates).map(async ([key, value]) => {
        await Settings.findOneAndUpdate(
          { key },
          { value, updatedBy: req.user?._id },
          { upsert: true, new: true }
        );
        updatedKeys.push(key);
      })
    );

    await AuditLog.create({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: 'update_settings',
      resource: 'settings',
      details: { updatedKeys },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success',
    });

    res.json({ message: 'Settings updated', updatedKeys });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── SECURITY / AUDIT LOG ────────────────────────────────────────────────────

// GET /api/admin/security/audit-log
router.get(
  '/security/audit-log',
  protect,
  adminOnly,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;
      const action = req.query.action as string;
      const userId = req.query.userId as string;

      const filter: any = {};
      if (action) filter.action = action;
      if (userId) filter.userId = userId;

      const [logs, total] = await Promise.all([
        AuditLog.find(filter)
          .populate('userId', 'name email')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        AuditLog.countDocuments(filter),
      ]);

      res.json({ logs, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET /api/admin/security/stats
router.get(
  '/security/stats',
  protect,
  adminOnly,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const last30days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const [totalLogs, failedAttempts, recentActivity, actionBreakdown, activeUsers] =
        await Promise.all([
          AuditLog.countDocuments({ createdAt: { $gte: last30days } }),
          AuditLog.countDocuments({ status: 'failure', createdAt: { $gte: last30days } }),
          AuditLog.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10),
          AuditLog.aggregate([
            { $match: { createdAt: { $gte: last30days } } },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
          User.countDocuments({ isActive: true }),
        ]);

      res.json({ totalLogs, failedAttempts, activeUsers, recentActivity, actionBreakdown });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/admin/security/change-password
router.post(
  '/security/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    // Prevent pre-hashed string bypass in payload
    if (req.body.newPassword && (req.body.newPassword.startsWith('$2a$') || req.body.newPassword.startsWith('$2b$') || req.body.newPassword.startsWith('$2y$')) && req.body.newPassword.length === 60) {
      res.status(400).json({ errors: [{ msg: 'Invalid password format. Cannot use a pre-hashed string.' }] });
      return;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user?._id).select('+password');

      if (!user || !(await user.comparePassword(currentPassword))) {
        await AuditLog.create({
          userId: req.user?._id,
          userEmail: req.user?.email,
          action: 'change_password',
          resource: 'user',
          resourceId: String(req.user?._id),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          status: 'failure',
          details: { reason: 'incorrect_current_password' },
        });
        res.status(400).json({ message: 'Current password is incorrect' });
        return;
      }

      user.password = newPassword;
      await user.save();

      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email,
        action: 'change_password',
        resource: 'user',
        resourceId: String(req.user?._id),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'success',
      });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// POST /api/admin/security/audit — log a custom action
router.post(
  '/security/audit',
  protect,
  staffOrAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { action, resource, resourceId, details } = req.body;
      await AuditLog.create({
        userId: req.user?._id,
        userEmail: req.user?.email,
        action,
        resource,
        resourceId,
        details,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'success',
      });
      res.json({ message: 'Action logged' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;