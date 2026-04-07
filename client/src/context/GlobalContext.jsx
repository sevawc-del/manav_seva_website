import React, { createContext, useState } from 'react';

const AppGlobalContext = createContext();

const GlobalProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Global state for application-wide data
  const [globalData, setGlobalData] = useState({
    news: [],
    events: [],
    gallery: [],
    reports: []
  });

  // Function to show loading state
  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  // Function to set error
  const setGlobalError = (errorMessage) => setError(errorMessage);
  const clearError = () => setError(null);

  // Function to update global data
  const updateGlobalData = (key, data) => {
    setGlobalData(prev => ({
      ...prev,
      [key]: data
    }));
  };

  // Context value
  const value = {
    loading,
    error,
    user,
    globalData,
    showLoading,
    hideLoading,
    setGlobalError,
    clearError,
    setUser,
    updateGlobalData
  };

  return (
    <AppGlobalContext.Provider value={value}>
      {children}
    </AppGlobalContext.Provider>
  );
};

export default GlobalProvider;
