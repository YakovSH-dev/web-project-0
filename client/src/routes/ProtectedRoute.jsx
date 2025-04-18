import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth(); // Use context

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

  // Render the child route component if authenticated
  console.log('ProtectedRoute: Authenticated, rendering Outlet');
  return <Outlet />; 
};

export default ProtectedRoute; 