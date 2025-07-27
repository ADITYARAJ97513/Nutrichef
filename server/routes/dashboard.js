import express from 'express';
import { authenticate } from '../middleware/auth.js';
import PantryItem from '../models/PantryItem.js';
import Recipe from '../models/Recipe.js';
import MealPlan from '../models/MealPlan.js';

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDateThreshold = new Date();
  expiryDateThreshold.setDate(expiryDateThreshold.getDate() + 3);

  const [pantryItems, expiringItems, recipesGenerated, mealsPlanned] = await Promise.all([
    PantryItem.countDocuments({ createdBy: userId }),
    PantryItem.countDocuments({ 
        createdBy: userId, 
        expiryDate: { $gte: today, $lte: expiryDateThreshold } 
    }),
    Recipe.countDocuments({ createdBy: userId }),
    MealPlan.countDocuments({ createdBy: userId }),
  ]);

  res.status(200).json({ pantryItems, expiringItems, recipesGenerated, mealsPlanned });
}));

router.get('/activity', authenticate, asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [recentPantryItems, recentRecipes, recentMealPlans] = await Promise.all([
    PantryItem.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(5),
    Recipe.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(5),
    MealPlan.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(5),
  ]);

  const pantryActivities = recentPantryItems.map(item => ({ type: 'pantry', description: `Added '${item.name}' to your pantry.`, timestamp: item.createdAt, id: item._id }));
  const recipeActivities = recentRecipes.map(item => ({ type: 'recipe', description: `Created the '${item.title}' recipe.`, timestamp: item.createdAt, id: item._id }));
  const mealPlanActivities = recentMealPlans.map(item => ({ type: 'meal_plan', description: `Planned meals for ${new Date(item.date).toLocaleDateString()}.`, timestamp: item.createdAt, id: item._id }));

  const combinedActivities = [...pantryActivities, ...recipeActivities, ...mealPlanActivities]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  res.status(200).json(combinedActivities);
}));



export default router;