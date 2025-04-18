import React from 'react';
import {
  createBrowserRouter,
  Outlet // Import Outlet for the root layout
} from "react-router-dom";
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider

// Import Page Components
import DashboardPage from '../pages/DashboardPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

// Import Layout & Protection Components
import MainLayout from '../components/layout/MainLayout.jsx'; // Import the layout
import ProtectedRoute from './ProtectedRoute.jsx';

// Define a Root component that provides the Auth context
const RootLayout = () => {
  return (
    <AuthProvider>
      <Outlet /> {/* Child routes will render here, inheriting AuthContext */} 
    </AuthProvider>
  );
};

const router = createBrowserRouter([
  {
    element: <RootLayout />, // Root layout provides Auth context to all descendants
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <MainLayout /> 
          </ProtectedRoute>
        ),
        children: [
          {
            path: "", 
            element: <DashboardPage />,
          },
          // Other protected routes nested under MainLayout go here
        ],
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "*", 
        element: <NotFoundPage />,
      },
    ]
  }
]);

// Remove the AppRouter component, just export the router instance
// const AppRouter = () => { ... };

export default router; // Export the router instance directly 