import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// Import Page Components
import App from '../App.jsx'; // Main App layout (optional, can be root)
import DashboardPage from '../pages/DashboardPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

// Import Route Protection Component
import ProtectedRoute from './ProtectedRoute.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "", // Default route within protected section
        element: <DashboardPage />,
        // loader: dashboardLoader, // Example: Add data loaders if needed
      },
      // Add other protected routes here (e.g., settings, profile)
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
    path: "*", // Catch-all for unmatched routes
    element: <NotFoundPage />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter; 