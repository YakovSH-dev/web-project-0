import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Accept children as a prop
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking auth status
  if (isLoading) {
    // TODO: Replace with a proper loading spinner/component
    return <div className="flex items-center justify-center min-h-screen">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    console.log('ProtectedRoute: Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Render the children that were passed in (e.g., <MainLayout />)
  console.log('ProtectedRoute: Authenticated, rendering children');
  return children; 
};

export default ProtectedRoute; 