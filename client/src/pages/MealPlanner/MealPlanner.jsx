import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, ChefHat, Crown, Download, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import MealPlanCard from '../../components/MealPlanner/MealPlanCard';
import AddMealModal from '../../components/MealPlanner/AddMealModal';


const AIGenerationModal = ({ onClose, onGenerate }) => {
    const [dietary, setDietary] = useState('any');
    const [healthGoal, setHealthGoal] = useState('any');
    const handleGenerateClick = () => {
        onGenerate({ dietary, healthGoal });
        onClose();
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center"><Sparkles className="h-6 w-6 text-accent-500 mr-2" />AI Meal Plan Options</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    <div className="space-y-6">
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
                            <span>Generate 7-Day Plan</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
const MealDetailModal = ({ meal, onClose }) => {
    if (!meal) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className={`capitalize text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800`}>{meal.type}</span>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">{meal.name}</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                        {meal.calories > 0 && <span>{meal.calories} calories</span>}
                        {meal.nutrition?.protein > 0 && <span className="mx-2">|</span>}
                        {meal.nutrition?.protein > 0 && <span>{meal.nutrition.protein}g Protein</span>}
                    </div>
                    {meal.ingredients && meal.ingredients.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-md font-semibold text-gray-800 mb-2">Ingredients</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {meal.ingredients.map((ing, index) => (
                                    <li key={index}>{`${ing.quantity || ''} ${ing.unit || ''} ${ing.name}`.trim()}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {meal.notes && (
                        <div>
                             <h4 className="text-md font-semibold text-gray-800 mb-2">Notes</h4>
                             <p className="text-gray-700 whitespace-pre-wrap">{meal.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const MealPlanner = () => {
    const { user } = useAuth();
    const [mealPlans, setMealPlans] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedMeal, setSelectedMeal] = useState(null);

    const isPro = user?.role === 'pro_user' || user?.role === 'admin';

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day; 
        return new Date(d.setDate(diff));
    };

    const fetchMealPlans = useCallback(async () => {
        setLoading(true);
        try {
            const startOfWeek = getStartOfWeek(selectedWeek);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            const response = await axios.get('/api/meal-plans', {
                params: {
                    startDate: startOfWeek.toISOString(),
                    endDate: endOfWeek.toISOString(),
                    timestamp: new Date().getTime() 
                },
            });
            setMealPlans(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast.error('Failed to fetch meal plans');
        } finally {
            setLoading(false);
        }
    }, [selectedWeek]);

    useEffect(() => {
        fetchMealPlans();
    }, [fetchMealPlans]);

    const getWeekDays = () => {
        const startOfWeek = getStartOfWeek(selectedWeek);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const getMealsForDate = (date) => {
        const dateString = date.toISOString().split('T')[0];
        if (!Array.isArray(mealPlans)) return [];
        const mealPlan = mealPlans.find(plan => plan.date.startsWith(dateString));
        return mealPlan?.meals || [];
    };

    const generateAIMealPlan = async (options) => {
        if (!isPro) {
            toast.error('AI meal planning is a Pro feature');
            return;
        }
        setLoading(true);
        const toastId = toast.loading('Generating your personalized meal plan...');
        try {
            const startOfWeek = getStartOfWeek(selectedWeek);
            await axios.post('/api/meal-plans/ai-generate', {
                startDate: startOfWeek.toISOString(),
                dietary: options.dietary,
                healthGoal: options.healthGoal,
            });
            await fetchMealPlans();
            toast.success('AI meal plan generated successfully!', { id: toastId });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate AI meal plan', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const exportMealPlan = async () => {
        if (!isPro) {
            toast.error('Meal plan export is a Pro feature');
            return;
        }
        try {
            const startOfWeek = getStartOfWeek(selectedWeek);
            const response = await axios.post('/api/meal-plans/export', { startDate: startOfWeek.toISOString() }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `meal-plan-${startOfWeek.toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Meal plan exported successfully!');
        } catch (error) {
            toast.error('Failed to export meal plan');
        }
    };

    const addMeal = async (date, meal) => {
        try {
            await axios.post('/api/meal-plans', { date, meal });
            await fetchMealPlans();
            toast.success('Meal added successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add meal');
        }
    };

    const previousWeek = () => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(newDate.getDate() - 7);
        setSelectedWeek(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(newDate.getDate() + 7);
        setSelectedWeek(newDate);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const weekDays = getWeekDays();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
                    <p className="text-gray-600 mt-1">Plan your weekly meals and stay organized</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 md:mt-0">
                    {isPro && (
                        <>
                            <button onClick={() => setShowAIModal(true)} className="bg-accent-600 hover:bg-accent-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
                                <ChefHat className="h-5 w-5" />
                                <span>Generate AI Plan</span>
                            </button>
                            <button onClick={exportMealPlan} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
                                <Download className="h-5 w-5" />
                                <span>Export PDF</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mb-8">
                <button onClick={previousWeek} className="btn-secondary flex items-center space-x-2">
                    <span>← Previous Week</span>
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
                        {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>
                </div>
                <button onClick={nextWeek} className="btn-secondary flex items-center space-x-2">
                    <span>Next Week →</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                {weekDays.map((day, index) => {
                    const meals = getMealsForDate(day);
                    const dateString = day.toISOString().split('T')[0];
                    return (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{day.toLocaleDateString('en-US', { weekday: 'short' })}</h3>
                                        <p className="text-sm text-gray-600">{day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedDate(dateString); setShowAddModal(true); }}
                                        className="text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={day < new Date(new Date().setHours(0,0,0,0))}
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {meals.length > 0 ? (
                                    meals.map((meal, mealIndex) => (
                                        <MealPlanCard 
                                            key={meal._id || mealIndex} 
                                            meal={meal} 
                                            onClick={() => setSelectedMeal(meal)} 
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No meals planned</p>
                                        <button
                                            onClick={() => { setSelectedDate(dateString); setShowAddModal(true); }}
                                            className="text-primary-600 hover:text-primary-700 text-sm mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={day < new Date(new Date().setHours(0,0,0,0))}
                                        >
                                            Add meal
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!isPro && (
                <div className="mt-12 bg-gradient-to-r from-accent-50 to-primary-50 rounded-lg p-8 text-center">
                    <Crown className="h-12 w-12 text-accent-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Unlock Pro Meal Planning Features</h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Get AI-generated meal plans, nutrition tracking, grocery list generation, and PDF exports with NutriChef Pro.</p>
                    <a href="/payment" className="bg-accent-600 hover:bg-accent-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                        Upgrade to Pro
                    </a>
                </div>
            )}

            {showAddModal && (
                <AddMealModal
                    date={selectedDate}
                    onClose={() => setShowAddModal(false)}
                    onAdd={(meal) => addMeal(selectedDate, meal)}
                />
            )}

            {showAIModal && (
                <AIGenerationModal
                    onClose={() => setShowAIModal(false)}
                    onGenerate={generateAIMealPlan}
                />
            )}
            
            {selectedMeal && (
                <MealDetailModal 
                    meal={selectedMeal}
                    onClose={() => setSelectedMeal(null)}
                />
            )}
        </div>
    );
};

export default MealPlanner;