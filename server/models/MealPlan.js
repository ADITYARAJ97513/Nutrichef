import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Meal name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
  },
  ingredients: [{
    name: String,
    quantity: String,
    unit: String,
  }],
  calories: {
    type: Number,
    min: 0,
    default: 0,
  },
  nutrition: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
});

const mealPlanSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  meals: [mealSchema],
  totalCalories: {
    type: Number,
    default: 0,
  },
  totalNutrition: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
  isAIGenerated: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
}, {
  timestamps: true,
});
mealPlanSchema.pre('save', function(next) {
  if (this.isModified('meals')) {
    this.totalCalories = this.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    
    this.totalNutrition = this.meals.reduce((total, meal) => {
      total.protein += meal.nutrition?.protein || 0;
      total.carbs += meal.nutrition?.carbs || 0;
      total.fat += meal.nutrition?.fat || 0;
      total.fiber += meal.nutrition?.fiber || 0;
      return total;
    }, { protein: 0, carbs: 0, fat: 0, fiber: 0 });
    this.meals.forEach(meal => {
        if (meal.isModified('isCompleted') && meal.isCompleted && !meal.completedAt) {
            meal.completedAt = new Date();
        }
    });
  }
  next();
});
mealPlanSchema.index({ createdBy: 1, date: 1 }, { unique: true });

export default mongoose.model('MealPlan', mealPlanSchema);