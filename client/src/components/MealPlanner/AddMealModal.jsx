import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddMealModal = ({ date, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'breakfast',
    calories: '',
    ingredients: [''], 
    notes: '', 
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter a meal name');
      return;
    }
    const formattedIngredients = formData.ingredients
      .filter(ing => ing.trim() !== '')
      .map(ingString => ({
        name: ingString.trim(),
        quantity: '', 
        unit: '',
      }));
    const mealPayload = {
      name: formData.name,
      type: formData.type,
      calories: formData.calories ? parseInt(formData.calories) : 0,
      ingredients: formattedIngredients,
      notes: formData.notes,
    };

    onAdd(mealPayload);
    onClose(); 
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ''],
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Meal for {new Date(date).toLocaleDateString()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Meal Name *
            </label>
            <input
              type="text"
              id="name"
              className="input-field"
              placeholder="e.g., Grilled Chicken Salad"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Meal Type
              </label>
              <select
                id="type"
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
                Calories (optional)
              </label>
              <input
                type="number"
                id="calories"
                className="input-field"
                placeholder="e.g., 350"
                value={formData.calories || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    calories: e.target.value ? parseInt(e.target.value) : '',
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients
            </label>
            <div className="space-y-2">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="e.g., 2 chicken breasts"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-600 hover:text-red-700 px-2"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                + Add ingredient
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              className="input-field"
              placeholder="Brief cooking instructions or notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Add Meal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMealModal;