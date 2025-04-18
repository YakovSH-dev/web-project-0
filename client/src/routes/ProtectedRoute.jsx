import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Placeholder for auth logic - replace with actual context/store check
const useAuth = () => {
  // TODO: Replace this with actual authentication check
  // For now, assume the user is authenticated if there's a token in localStorage
  // THIS IS NOT SECURE FOR PRODUCTION - just for basic routing setup
  const token = localStorage.getItem('authToken'); // Example placeholder check
  const isAuthenticated = !!token;
  console.log('ProtectedRoute Check: isAuthenticated?', isAuthenticated);
  return { isAuthenticated };
};

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    console.log('Redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Render the child route component if authenticated
  return <Outlet />; 
};

export default ProtectedRoute; 