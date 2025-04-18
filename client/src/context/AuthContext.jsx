// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/auth'; // Assuming getUserProfile might be added here later
import apiClient from '../services/apiClient'; // Needed to potentially clear interceptors on logout

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
  const [user, setUser] = useState(null); // Store basic user info if needed
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [isLoading, setIsLoading] = useState(true); // Start loading until initial check is done
  const navigate = useNavigate();

  // --- Effect for Initial Load --- 
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        setIsAuthenticated(true);
        // Optional: Fetch user profile here using the token to confirm validity
        // try {
        //   const profile = await getUserProfile(); // You'd need to create this service function
        //   setUser(profile);
        // } catch (error) {
        //   console.error("Failed to fetch user profile on init:", error);
        //   // Token might be invalid, log out
        //   handleLogout(false); // Pass false to avoid navigation if already checking
        // }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [token]); // Re-run if token changes externally (less likely)

  // --- Login Function --- 
  const login = useCallback(async (credentials) => {
    try {
      const data = await loginUser(credentials);
      if (data.token) {
        setToken(data.token);
        setUser(data.user || null); // Assuming backend sends user info
        localStorage.setItem('authToken', data.token);
        setIsAuthenticated(true);
        navigate('/', { replace: true }); // Go to dashboard
      } else {
        throw new Error('Login failed: No token received.');
      }
    } catch (error) {
      console.error('AuthContext login error:', error);
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      localStorage.removeItem('authToken');
      throw error; // Re-throw error to be caught in the form
    }
  }, [navigate]);

  // --- Register Function --- 
  // Currently just calls the API, doesn't log in automatically
  const register = useCallback(async (userData) => {
    try {
      await registerUser(userData);
      // Success handled in the form (showing message)
      // Optionally, call login() here if backend returns token on register
    } catch (error) {
      console.error('AuthContext register error:', error);
      throw error; // Re-throw error to be caught in the form
    }
  }, []);

  // --- Logout Function ---
  const logout = useCallback((shouldNavigate = true) => {
    console.log('Logging out via AuthContext');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    // Optional: Clear Axios default headers if necessary (though interceptor handles adding)
    // delete apiClient.defaults.headers.common['Authorization']; 
    if (shouldNavigate) {
        navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    token,
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  }), [token, user, isAuthenticated, isLoading, login, register, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 