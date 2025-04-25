import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * Composant pour protéger les routes nécessitant une authentification
 * À utiliser dans le Router : <Route element={<ProtectedRoute><ComponentToProtect /></ProtectedRoute>} />
 */
const ProtectedRoute = ({ children }) => {
    const { user, isLoading } = useAppContext();
    const location = useLocation();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;