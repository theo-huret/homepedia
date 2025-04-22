import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [filters, setFilters] = useState({
        region: '',
        departement: '',
        commune: '',
        propertyType: 'apartment',
        indicator: 'prix',
        timeFrame: '2023',
    });

    const updateFilters = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const clearError = () => {
        setError(null);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        isLoading,
        setIsLoading,
        error,
        setError,
        clearError,
        user,
        setUser,
        filters,
        updateFilters,
        logout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};