import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddItemModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'pieces',
    category: 'other',
    expiryDate: '',
  });

  const units = ['pieces', 'kg', 'grams', 'liters', 'ml', 'cups', 'tbsp', 'tsp'];
  const categories = ['vegetables', 'fruits', 'dairy', 'meat', 'grains', 'spices', 'other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.expiryDate) {
      alert('Please fill in all required fields');
      return;
    }
    onAdd(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Pantry Item</h2>
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
              Item Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="input-field"
              placeholder="e.g., Tomatoes, Milk, Chicken"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="text"
                id="quantity"
                name="quantity"
                className="input-field"
                placeholder="e.g., 2, 500"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                className="input-field"
                value={formData.unit}
                onChange={handleChange}
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              className="input-field"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date *
            </label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              className="input-field"
              value={formData.expiryDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
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
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
