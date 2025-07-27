import express from 'express';
import { authenticate } from '../middleware/auth.js';
import PantryItem from '../models/PantryItem.js'; 

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { sortBy = 'expiryDate', order = 'asc' } = req.query;

  const sortOptions = {};
  sortOptions[sortBy] = order === 'asc' ? 1 : -1;

  const items = await PantryItem.find({ createdBy: req.user._id }).sort(sortOptions);
  res.status(200).json(items);
}));

router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { name, quantity, unit, category, purchaseDate, expiryDate } = req.body;

  if (!name || !quantity || !expiryDate) {
    return res.status(400).json({ message: 'Name, quantity, and expiry date are required.' });
  }

  const newItem = new PantryItem({
    name,
    quantity,
    unit,
    category,
    purchaseDate,
    expiryDate,
    createdBy: req.user._id,
  });

  await newItem.save();
  res.status(201).json(newItem);
}));

router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const item = await PantryItem.findOne({ _id: req.params.id, createdBy: req.user._id });

  if (!item) {
    return res.status(404).json({ message: 'Pantry item not found.' });
  }

  Object.assign(item, req.body);
  
  await item.save();
  res.status(200).json(item);
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const item = await PantryItem.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });

  if (!item) {
    return res.status(404).json({ message: 'Pantry item not found.' });
  }

  res.status(200).json({ message: 'Pantry item deleted successfully.' });
}));

router.get('/expiring', authenticate, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 7;
  const expiryDateThreshold = new Date();
  expiryDateThreshold.setDate(expiryDateThreshold.getDate() + days);

  const expiringItems = await PantryItem.find({
    createdBy: req.user._id,
    expiryDate: { $lte: expiryDateThreshold }
  }).sort({ expiryDate: 1 });

  res.status(200).json(expiringItems);
}));

export default router;
