import React from 'react';
const MealPlanCard = ({ meal, onClick }) => {
  const getMealTypeColor = (type) => {
    switch (type) {
      case 'breakfast':
        return 'bg-yellow-100 text-yellow-800';
      case 'lunch':
        return 'bg-blue-100 text-blue-800';
      case 'dinner':
        return 'bg-purple-100 text-purple-800';
      case 'snack':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <button 
      onClick={onClick} 
      className="w-full text-left bg-gray-50 rounded-lg p-3 hover:bg-gray-100 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`capitalize text-xs font-medium px-2 py-1 rounded-full ${getMealTypeColor(meal.type)}`}>
          {meal.type}
        </span>
        {meal.calories > 0 && (
          <span className="text-xs text-gray-600">{meal.calories} cal</span>
        )}
      </div>
      
      <h4 className="font-medium text-gray-900 text-sm mb-2 truncate">{meal.name}</h4>
      
      {meal.ingredients && meal.ingredients.length > 0 && (
        <div className="text-xs text-gray-600">
          <ul className="space-y-1">
            {meal.ingredients.slice(0, 2).map((ingredient, index) => (
              <li key={index} className="text-xs truncate">• {ingredient.name}</li>
            ))}
            {meal.ingredients.length > 2 && (
              <li className="text-xs text-gray-500">+ {meal.ingredients.length - 2} more</li>
            )}
          </ul>
        </div>
      )}
    </button>
  );
};

export default MealPlanCard;