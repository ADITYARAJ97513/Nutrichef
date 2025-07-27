import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Clock, Users, ChefHat, Heart, Crown, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const RecipeDetailModal = ({ recipe, onClose, isPro }) => {
    if (!recipe) return null;
    const canView = !recipe.isPro || isPro;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    {!canView ? (
                        <div className="text-center py-12">
                            <Crown className="h-12 w-12 text-accent-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-800">Pro Recipe</h3>
                            <p className="text-gray-600 mt-2">Upgrade to a Pro account to view the full details of this recipe.</p>
                            <a href="/payment" className="mt-6 btn-primary">Upgrade Now</a>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-6">{recipe.description}</p>
                            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                                <div className="flex items-center"><Clock className="h-4 w-4 mr-1.5" /><span>{recipe.cookingTime} min cook</span></div>
                                <div className="flex items-center"><Users className="h-4 w-4 mr-1.5" /><span>{recipe.servings} servings</span></div>
                                <div className={`capitalize px-2 py-1 rounded text-xs font-medium ${recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' : recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{recipe.difficulty}</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h4>
                                    <ul className="space-y-2">
                                        {recipe.ingredients.map((ing, index) => (<li key={index} className="text-gray-700">{ing.quantity} {ing.unit} {ing.name}</li>))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h4>
                                    <ol className="space-y-3 list-decimal list-inside">
                                        {recipe.instructions.map((step, index) => (<li key={index} className="text-gray-700">{step.description}</li>))}
                                    </ol>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- New Modal for AI Generation Pro Features ---
const AIGenerationModal = ({ pantryIngredients, onClose, onGenerate }) => {
    const [selectedIngredients, setSelectedIngredients] = useState(pantryIngredients);
    const [dietary, setDietary] = useState('any');
    const [healthGoal, setHealthGoal] = useState('any');

    const handleIngredientToggle = (ingredient) => {
        setSelectedIngredients(prev =>
            prev.includes(ingredient) ? prev.filter(i => i !== ingredient) : [...prev, ingredient]
        );
    };

    const handleGenerateClick = () => {
        if (selectedIngredients.length === 0) {
            toast.error("Please select at least one ingredient.");
            return;
        }
        onGenerate({
            ingredients: selectedIngredients,
            dietary,
            healthGoal
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center"><Sparkles className="h-6 w-6 text-accent-500 mr-2" />AI Recipe Generator</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Ingredients from Your Pantry</label>
                            <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                                {pantryIngredients.map(ing => (
                                    <div key={ing} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={ing}
                                            checked={selectedIngredients.includes(ing)}
                                            onChange={() => handleIngredientToggle(ing)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <label htmlFor={ing} className="ml-3 text-sm text-gray-600 capitalize">{ing}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="dietary" className="block text-sm font-medium text-gray-700">Specific Dietary Plan</label>
                            <select id="dietary" value={dietary} onChange={(e) => setDietary(e.target.value)} className="mt-1 block w-full input-field">
                                <option value="any">Any (Based on your profile)</option>
                                <option value="vegetarian">Vegetarian</option>
                                <option value="vegan">Vegan</option>
                                <option value="gluten-free">Gluten-Free</option>
                                <option value="keto">Keto</option>
                                <option value="paleo">Paleo</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="healthGoal" className="block text-sm font-medium text-gray-700">Health Goal</label>
                            <select id="healthGoal" value={healthGoal} onChange={(e) => setHealthGoal(e.target.value)} className="mt-1 block w-full input-field">
                                <option value="any">Any (Balanced)</option>
                                <option value="healthy">Healthy & Low Calorie</option>
                                <option value="weight_gain">High Protein / Weight Gain</option>
                                <option value="comfort_food">Indulgent / Comfort Food</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button onClick={handleGenerateClick} className="w-full btn-primary flex items-center justify-center space-x-2">
                            <Sparkles className="h-5 w-5" />
                            <span>Generate Recipe</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Recipes = () => {
    const { user } = useAuth();
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [pantryIngredients, setPantryIngredients] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showAIGenerationModal, setShowAIGenerationModal] = useState(false);

    const isPro = user?.role === 'pro_user' || user?.role === 'admin';
    const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
    const difficulties = ['all', 'easy', 'medium', 'hard'];

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [recipesResponse, pantryResponse] = await Promise.all([
                axios.get('/api/recipes'),
                axios.get('/api/pantry')
            ]);
            setRecipes(recipesResponse.data);
            setPantryIngredients(pantryResponse.data.map(item => item.name.toLowerCase()));
        } catch (error) {
            toast.error('Failed to fetch page data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const filterRecipes = useCallback(() => {
        let filtered = recipes.filter(recipe => {
            const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
            const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
            return matchesSearch && matchesCategory && matchesDifficulty;
        });
        filtered.sort((a, b) => {
            const aMatches = a.ingredients.filter(ing => pantryIngredients.some(pantryIng => ing.name.toLowerCase().includes(pantryIng) || pantryIng.includes(ing.name.toLowerCase()))).length;
            const bMatches = b.ingredients.filter(ing => pantryIngredients.some(pantryIng => ing.name.toLowerCase().includes(pantryIng) || pantryIng.includes(ing.name.toLowerCase()))).length;
            return bMatches - aMatches;
        });
        setFilteredRecipes(filtered);
    }, [recipes, searchTerm, selectedCategory, selectedDifficulty, pantryIngredients]);

    useEffect(() => {
        filterRecipes();
    }, [filterRecipes]);

    const getAvailableIngredients = (ingredients) => {
        return ingredients.filter(ingredient =>
            pantryIngredients.some(pantryIng =>
                ingredient.name.toLowerCase().includes(pantryIng) || pantryIng.includes(ingredient.name.toLowerCase())
            )
        ).length;
    };

    const generateAIRecipes = async (options) => {
        setIsGenerating(true);
        const toastId = toast.loading('Generating personalized recipes...');
        try {
            const response = await axios.post('/api/recipes/ai-generate', options);
            setRecipes(prevRecipes => [...response.data, ...prevRecipes]);
            toast.success('New AI recipes generated!', { id: toastId });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate AI recipes', { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Recipe Collection</h1>
                    <p className="text-gray-600 mt-1">
                        Discover delicious recipes based on your pantry ingredients
                    </p>
                </div>
                {isPro && (
                    <button
                        onClick={() => setShowAIGenerationModal(true)}
                        disabled={isGenerating}
                        className="mt-4 md:mt-0 bg-accent-600 hover:bg-accent-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChefHat className="h-5 w-5" />
                        <span>{isGenerating ? 'Generating...' : 'Generate AI Recipes'}</span>
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card">
                    <div className="flex items-center">
                        <div className="bg-primary-100 p-3 rounded-lg"><ChefHat className="h-6 w-6 text-primary-600" /></div>
                        <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                            <p className="text-gray-600">Total Recipes</p>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg"><Heart className="h-6 w-6 text-green-600" /></div>
                        <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">{filteredRecipes.filter(r => getAvailableIngredients(r.ingredients) > 0).length}</p>
                            <p className="text-gray-600">Can Make Now</p>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="flex items-center">
                        <div className="bg-accent-100 p-3 rounded-lg"><Crown className="h-6 w-6 text-accent-600" /></div>
                        <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">{recipes.filter(r => r.isPro).length}</p>
                            <p className="text-gray-600">Pro Recipes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-4 lg:space-y-0">
                    <div className="relative flex-1">
                        <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input type="text" placeholder="Search recipes..." className="input-field pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="relative">
                        <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <select className="input-field pl-10 w-full lg:w-48" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            {categories.map(category => (<option key={category} value={category}>{category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}</option>))}
                        </select>
                    </div>
                    <div>
                        <select className="input-field w-full lg:w-32" value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                            {difficulties.map(difficulty => (<option key={difficulty} value={difficulty}>{difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</option>))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Recipes Grid */}
            {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map((recipe) => {
                        const availableIngredients = getAvailableIngredients(recipe.ingredients);
                        const canMake = availableIngredients > 0;
                        return (
                            <div key={recipe._id} className={`card hover:shadow-lg transition-shadow ${recipe.isPro && !isPro ? 'opacity-60' : ''}`}>
                                {recipe.isPro && (
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="bg-accent-100 text-accent-800 text-xs font-medium px-2 py-1 rounded-full flex items-center"><Crown className="h-3 w-3 mr-1" />Pro Recipe</span>
                                        {!isPro && (<span className="text-xs text-gray-500">Upgrade to unlock</span>)}
                                    </div>
                                )}
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.title}</h3>
                                    <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center"><Clock className="h-4 w-4 mr-1" /><span>{recipe.cookingTime} min</span></div>
                                    <div className="flex items-center"><Users className="h-4 w-4 mr-1" /><span>{recipe.servings} servings</span></div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' : recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{recipe.difficulty}</div>
                                </div>
                                {canMake && (
                                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center text-green-800 text-sm"><Heart className="h-4 w-4 mr-2" /><span>You have {availableIngredients} of {recipe.ingredients.length} ingredients</span></div>
                                    </div>
                                )}
                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Ingredients:</h4>
                                    <div className="space-y-1">
                                        {recipe.ingredients.slice(0, 3).map((ingredient, index) => {
                                            const isAvailable = pantryIngredients.some(pantryIng => ingredient.name.toLowerCase().includes(pantryIng) || pantryIng.includes(ingredient.name.toLowerCase()));
                                            return (<div key={index} className={`text-sm ${isAvailable ? 'text-green-600 font-medium' : 'text-gray-600'}`}>• {ingredient.name}</div>);
                                        })}
                                        {recipe.ingredients.length > 3 && (<div className="text-sm text-gray-500">+ {recipe.ingredients.length - 3} more ingredients</div>)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedRecipe(recipe)}
                                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={recipe.isPro && !isPro}
                                >
                                    {recipe.isPro && !isPro ? 'Upgrade to View' : 'View Recipe'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">Try adjusting your search or filter criteria to find more recipes.</p>
                </div>
            )}

            <RecipeDetailModal
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
                isPro={isPro}
            />
            
            {showAIGenerationModal && (
                <AIGenerationModal 
                    pantryIngredients={pantryIngredients}
                    onClose={() => setShowAIGenerationModal(false)}
                    onGenerate={generateAIRecipes}
                />
            )}
        </div>
    );
};

export default Recipes;