import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Recipe description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  ingredients: [{
    name: { type: String, required: true, trim: true },
    quantity: String,
    unit: String,
  }],
  instructions: [{
    step: { type: Number, required: true },
    description: { type: String, required: true },
  }],
  cookingTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [1, 'Cooking time must be at least 1 minute'],
  },
  prepTime: {
    type: Number,
    default: 0,
  },
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Must serve at least 1 person'],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'beverage'],
    required: true,
  },
  cuisine: {
    type: String,
    default: 'International',
  },
  dietary: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'keto', 'paleo', 'diabetic', 'gluten-free', 'dairy-free'],
  }],
  nutrition: {
    calories: Number, protein: Number, carbs: Number,
    fat: Number, fiber: Number, sugar: Number,
  },
  image: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  isPro: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});
recipeSchema.pre('save', function(next) {
  if (this.isModified('ratings')) {
    if (this.ratings.length === 0) {
      this.averageRating = 0;
      this.ratingCount = 0;
    } else {
      const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
      this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
      this.ratingCount = this.ratings.length;
    }
  }
  next();
});

recipeSchema.index({ category: 1, difficulty: 1 });
recipeSchema.index({ createdBy: 1 });
recipeSchema.index({ isPublic: 1, isApproved: 1 });
recipeSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Recipe', recipeSchema);