import mongoose from 'mongoose';

const pantryItemSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters'],
  },
  quantity: {
    type: String,
    required: [true, 'Quantity is required'],
  },
  unit: {
    type: String,
    required: true,
    enum: ['pieces', 'kg', 'grams', 'liters', 'ml', 'cups', 'tbsp', 'tsp', 'other'],
    default: 'pieces',
  },
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'dairy', 'meat', 'pantry', 'spices', 'other'],
    default: 'other',
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  isConsumed: {
    type: Boolean,
    default: false,
  },
  consumedAt: Date,
}, {
  timestamps: true,
});
pantryItemSchema.pre('save', function(next) {
  if (this.isModified('isConsumed') && this.isConsumed && !this.consumedAt) {
    this.consumedAt = new Date();
  }
  next();
});
pantryItemSchema.index({ createdBy: 1, expiryDate: 1 });
pantryItemSchema.index({ createdBy: 1, category: 1 });
pantryItemSchema.index({ createdBy: 1, isConsumed: 1 });

export default mongoose.model('PantryItem', pantryItemSchema);