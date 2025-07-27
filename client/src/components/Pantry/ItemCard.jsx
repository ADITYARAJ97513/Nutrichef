import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, AlertTriangle, Calendar } from 'lucide-react';

const ItemCard = ({ item, onDelete, onUpdate, isExpiringSoon }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    expiryDate: item.expiryDate,
  });

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSave = () => {
    onUpdate(item._id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      expiryDate: item.expiryDate,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDelete(item._id);
    }
    setShowMenu(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = () => {
    const today = new Date();
    const expiry = new Date(item.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilExpiry();

  return (
    <div className={`card relative ${isExpiringSoon ? 'border-red-200 bg-red-50' : ''}`}>
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Expiry Warning */}
      {isExpiringSoon && (
        <div className="flex items-center space-x-2 mb-3 text-red-700">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {daysLeft <= 0 ? 'Expired' : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="input-field text-lg font-semibold"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={editData.quantity}
              onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
              className="input-field text-sm"
            />
            <select
              value={editData.unit}
              onChange={(e) => setEditData({ ...editData, unit: e.target.value })}
              className="input-field text-sm"
            >
              <option value="pieces">pieces</option>
              <option value="kg">kg</option>
              <option value="grams">grams</option>
              <option value="liters">liters</option>
              <option value="ml">ml</option>
              <option value="cups">cups</option>
            </select>
          </div>

          <select
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
            className="input-field text-sm"
          >
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="dairy">Dairy</option>
            <option value="meat">Meat</option>
            <option value="grains">Grains</option>
            <option value="spices">Spices</option>
            <option value="other">Other</option>
          </select>

          <input
            type="date"
            value={editData.expiryDate}
            onChange={(e) => setEditData({ ...editData, expiryDate: e.target.value })}
            className="input-field text-sm"
          />

          <div className="flex space-x-2">
            <button onClick={handleSave} className="flex-1 btn-primary text-sm py-2">
              Save
            </button>
            <button onClick={handleCancel} className="flex-1 btn-secondary text-sm py-2">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 pr-8">{item.name}</h3>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Quantity:</span>
              <span className="font-medium">
                {item.quantity} {item.unit}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span>Category:</span>
              <span className="font-medium capitalize">{item.category}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Expires:</span>
              <span className={`font-medium ${isExpiringSoon ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDate(item.expiryDate)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              Added {formatDate(item.addedAt)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemCard;
