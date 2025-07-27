import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

const DataProvider = ({ children }) => {
  const { user } = useAuth();

  const [dashboardStats, setDashboardStats] = useState(null);
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);

  const refetchData = useCallback(async (showLoading = true) => {
    if (!user) return;
    
    if (showLoading) {
        setLoading(true);
    }
    try {
      const [statsRes, pantryRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/pantry')
      ]);
      setDashboardStats(statsRes.data);
      setPantryItems(pantryRes.data);
    } catch (error) {
      toast.error("Could not refresh data.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && !initialLoad) {
      refetchData();
      setInitialLoad(true);
    } else if (!user) {
      setDashboardStats(null);
      setPantryItems([]);
      setInitialLoad(false);
    }
  }, [user, initialLoad, refetchData]);

  const value = {
    dashboardStats,
    pantryItems,
    setPantryItems,
    loading,
    refetchData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataProvider;