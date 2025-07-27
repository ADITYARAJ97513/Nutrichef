import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useData } from "../../contexts/DataContext";
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Calendar,
  Package2,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import AddItemModal from "../../components/Pantry/AddItemModal";
import ItemCard from "../../components/Pantry/ItemCard";

const Pantry = () => {
  const { pantryItems, setPantryItems, loading, refetchData } = useData();

  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState("expiry");

  const filterCategories = ["all", "vegetables", "fruits", "dairy", "meat", "grains", "spices", "other"];

  useEffect(() => {
    let filtered = [...pantryItems];
    if (searchTerm) {
        filtered = filtered.filter((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    if (selectedCategory !== "all") {
        filtered = filtered.filter((item) => item.category === selectedCategory);
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "expiry": return new Date(a.expiryDate) - new Date(b.expiryDate);
        case "added": return new Date(b.createdAt) - new Date(a.createdAt);
        default: return 0;
      }
    });
    setFilteredItems(filtered);
  }, [pantryItems, searchTerm, selectedCategory, sortBy]);

  const handleAddItem = async (itemData) => {
    const tempId = `temp-${Date.now()}`;
    const newItem = { ...itemData, _id: tempId, createdAt: new Date().toISOString() };
    
    setPantryItems(prevItems => [...prevItems, newItem]);
    setShowAddModal(false);

    try {
        const response = await axios.post("/api/pantry", itemData);
        setPantryItems(prevItems => prevItems.map(item => item._id === tempId ? response.data : item));
        toast.success("Item added successfully!");
        refetchData(false); 
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to add item");
        setPantryItems(prevItems => prevItems.filter(item => item._id !== tempId));
    }
  };
  const handleDeleteItem = async (id) => {
    const originalItems = [...pantryItems];
    setPantryItems(prevItems => prevItems.filter((item) => item._id !== id));
    toast.success("Item deleted successfully!");
    
    try {
        await axios.delete(`/api/pantry/${id}`);
        refetchData(false);
    } catch (error) {
        toast.error("Failed to delete item. Reverting.");
        setPantryItems(originalItems);
    }
  };
  const handleUpdateItem = async (id, updates) => {
    const originalItems = [...pantryItems];
    setPantryItems(prevItems =>
      prevItems.map((item) => (item._id === id ? { ...item, ...updates } : item))
    );
    
    try {
        await axios.put(`/api/pantry/${id}`, updates);
        toast.success("Item updated successfully!");
        refetchData(false);
    } catch (error) {
        toast.error("Failed to update item. Reverting.");
        setPantryItems(originalItems);
    }
  };

  const uniqueCategoryCount = useMemo(() => {
    if (!pantryItems || pantryItems.length === 0) return 0;
    return new Set(pantryItems.map(item => item.category)).size;
  }, [pantryItems]);
  
  const expiringItemsCount = useMemo(() => {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      return pantryItems.filter((item) => new Date(item.expiryDate) <= threeDaysFromNow).length;
  }, [pantryItems]);

  if (loading && pantryItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Pantry</h1>
          <p className="text-gray-600 mt-1">
            Manage your kitchen inventory and track expiration dates
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Item</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Package2 className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{pantryItems.length}</p>
              <p className="text-gray-600">Total Items</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {expiringItemsCount}
              </p>
              <p className="text-gray-600">Expiring Soon</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {uniqueCategoryCount} 
              </p>
              <p className="text-gray-600">Categories</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search items..."
                className="input-field pl-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                className="input-field pl-10 w-full sm:w-48"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {filterCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Sort by:</span>
            <select
              className="input-field w-32"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="expiry">Expiry Date</option>
              <option value="name">Name</option>
              <option value="added">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onDelete={handleDeleteItem}
              onUpdate={handleUpdateItem}
              isExpiringSoon={new Date(item.expiryDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedCategory !== "all" ? "No items found" : "Your pantry is empty"}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Start by adding your first ingredient to keep track of your inventory."}
          </p>
          {!searchTerm && selectedCategory === "all" && (
            <button onClick={() => setShowAddModal(true)} className="mt-6 btn-primary">
              Add Your First Item
            </button>
          )}
        </div>
      )}
      
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  );
};

export default Pantry;