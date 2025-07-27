import express from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import Recipe from '../models/Recipe.js';
import axios from 'axios';

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const sanitizeAIRecipeData = (aiData) => {
  const sanitizedData = { ...aiData };
  const validCategories = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'beverage'];
  const validDietaryOptions = ['vegetarian', 'vegan', 'keto', 'paleo', 'diabetic', 'gluten-free', 'dairy-free'];

  // Sanitize Category
  if (aiData.category && validCategories.includes(aiData.category.toLowerCase())) {
      sanitizedData.category = aiData.category.toLowerCase();
  } else {
      sanitizedData.category = 'dinner'; // Assign a safe default if the AI provides an invalid category
  }

  // Sanitize Dietary: Ensure it's an array and filter for valid options
  if (Array.isArray(aiData.dietary)) {
    sanitizedData.dietary = aiData.dietary
      .map(d => String(d).toLowerCase())
      .filter(d => validDietaryOptions.includes(d));
  } else {
      sanitizedData.dietary = [];
  }

  // Sanitize Difficulty
  if (aiData.difficulty) {
      sanitizedData.difficulty = aiData.difficulty.toLowerCase();
  }

  return sanitizedData;
};
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const query = { isApproved: true };
  if (!req.user || (req.user.role !== 'pro_user' && req.user.role !== 'admin')) {
    query.isPro = false;
  }
  const recipes = await Recipe.find(query).sort({ createdAt: -1 }).populate('createdBy', 'name');
  res.json(recipes);
}));

router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'name');
  if (!recipe) {
    return res.status(404).json({ message: 'Recipe not found' });
  }
  if (recipe.isPro && (!req.user || (req.user.role !== 'pro_user' && req.user.role !== 'admin'))) {
    return res.status(403).json({ message: 'This is a Pro recipe. Please upgrade your plan to view.' });
  }
  res.json(recipe);
}));
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { title, ingredients, instructions } = req.body;
  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ message: 'Title, ingredients, and instructions are required.' });
  }
  const newRecipe = new Recipe({
    ...req.body,
    createdBy: req.user._id,
    isPro: false,
    isApproved: false,
  });
  await newRecipe.save();
  res.status(201).json(newRecipe);
}));
router.post('/ai-generate', authenticate, authorize('pro_user'), asyncHandler(async (req, res) => {
  const { ingredients, dietary, healthGoal } = req.body;
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ message: 'A non-empty array of ingredients is required.' });
  }
  
  const userPreferences = req.user.preferences;
  const finalDietary = (dietary && dietary !== 'any') ? dietary : (userPreferences.dietary.join(', ') || 'a standard balanced diet');
  const finalGoal = (healthGoal && healthGoal !== 'any') ? healthGoal : (userPreferences.goals || 'general wellness');
  const prompt = `You are an expert recipe creator. Generate a single, unique recipe.
CRITICAL INSTRUCTIONS:
1. The recipe MUST strictly follow this dietary requirement: **${finalDietary}**. This is the most important rule.
2. The recipe's style MUST match this health goal: **${finalGoal}**.
3. The recipe MUST use these ingredients: **${ingredients.join(', ')}**.
4. Allergies to AVOID: **${userPreferences.allergies.join(', ') || 'none'}**.

RESPONSE FORMATTING RULES:
- The "category" field MUST be exactly ONE of these values: "breakfast", "lunch", "dinner", "snack", "dessert", "beverage".
- The "dietary" field MUST be an array containing ONLY strings from this list: "vegetarian", "vegan", "keto", "paleo", "diabetic", "gluten-free", "dairy-free".
- All fields in the example below are required.

Strictly respond with a single JSON object in this exact format:
{
  "title": "...", "description": "...", "ingredients": [{ "name": "string", "quantity": "string", "unit": "string" }],
  "instructions": [{ "step": number, "description": "string" }], "cookingTime": number, "prepTime": number,
  "servings": number, "difficulty": "easy", "category": "dinner", "cuisine": "string", "dietary": ["string"]
}`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" }
    },
    { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` } }
  );

  let aiRecipeData;
  try {
    aiRecipeData = JSON.parse(response.data.choices[0].message.content);
  } catch (parseError) {
    console.error('Failed to parse AI response:', response.data.choices[0].message.content);
    return res.status(500).json({ message: 'AI failed to generate a valid recipe format. Please try again.' });
  }
  
  const sanitizedRecipeData = sanitizeAIRecipeData(aiRecipeData);
  
  const newRecipe = new Recipe({
      ...sanitizedRecipeData,
      createdBy: req.user._id,
      isPublic: true,
      isPro: true,
      isApproved: true,
  });

  await newRecipe.save();
  res.status(201).json([newRecipe]); 
}));

export default router;