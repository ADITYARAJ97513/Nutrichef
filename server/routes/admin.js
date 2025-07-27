import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/stats', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const planPrices = {
    monthly: 999,
    yearly: 9900,
  };

  const totalRevenueQuery = User.aggregate([
    { $match: { 'subscription.status': 'active' } },
    {
      $group: {
        _id: null,
        total: {
          $sum: {
            $cond: [
              { $eq: ['$subscription.plan', 'monthly'] },
              planPrices.monthly,
              { $cond: [{ $eq: ['$subscription.plan', 'yearly'] }, planPrices.yearly, 0] }
            ]
          }
        }
      }
    }
  ]);

  const [
    totalUsers, 
    proUsers, 
    totalRecipes, 
    recentUsers, 
    recentSubs, 
    revenueResult
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'pro_user' }),
    Recipe.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5),
    User.find({ "subscription.status": "active" }).sort({ "subscription.startDate": -1 }).limit(5),
    totalRevenueQuery,
  ]);
  
  const totalRevenue = revenueResult.length > 0 ? (revenueResult[0].total / 100) : 0;

  res.status(200).json({
    totalUsers,
    proUsers,
    totalRecipes,
    totalRevenue,
    recentUsers,
    recentSubscriptions: recentSubs.map(u => u.subscription),
  });
}));

router.get('/users', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { search, role, status } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (status) query.isActive = (status === 'active');

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    users,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}));

router.post('/users/:id/toggle-active', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.isActive = !user.isActive;
  await user.save();

  const message = `User has been ${user.isActive ? 'unbanned' : 'banned'}.`;
  res.status(200).json({ message, user });
}));

router.post('/users/:id/change-role', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { newRole } = req.body;
  if (!['free_user', 'pro_user', 'admin'].includes(newRole)) {
    return res.status(400).json({ message: 'Invalid role provided.' });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.role = newRole;
  await user.save();
  
  res.status(200).json({ message: `User role updated to ${newRole}.`, user });
}));

router.get('/content/recipes', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { status = 'pending' } = req.query;
  const query = {};
  
  if (status === 'pending') query.isApproved = false;
  if (status === 'approved') query.isApproved = true;

  const recipes = await Recipe.find(query).populate('createdBy', 'name email');
  res.status(200).json(recipes);
}));

export default router;
