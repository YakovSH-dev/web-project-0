// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, getUserProfile } from '../services/auth'; // Assuming getUserProfile might be added here later
import apiClient from '../services/apiClient'; // Needed to potentially clear interceptors on logout

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
  const [user, setUser] = useState(null); // Store basic user info if needed
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start as false until verified
  const [isLoading, setIsLoading] = useState(true); // Start loading until initial check is done
  const navigate = useNavigate();

  // --- Logout Function (defined earlier for use in effect) ---
  const logout = useCallback((shouldNavigate = true) => {
    console.log('Logging out via AuthContext');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    // Optional: Remove user info from local storage if you stored it
    // localStorage.removeItem('userInfo');
    if (shouldNavigate) {
        navigate('/login', { replace: true });
    }
  }, [navigate]);

  // --- Effect for Initial Load --- 
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    const initializeAuth = async () => {
      setIsLoading(true); // Set loading true at the start
      const storedToken = localStorage.getItem('authToken');
      try {
        if (storedToken) {
          console.log('AuthContext: Found token, verifying...');
          // Set token immediately for apiClient interceptor to use it
          setToken(storedToken); 
          const profile = await getUserProfile(); 
          if (isMounted) { // Check if component is still mounted
             setUser(profile); 
             setIsAuthenticated(true);
             console.log('AuthContext: Token verified, user loaded.', profile);
          }
        } else {
          if (isMounted) setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("AuthContext: Failed to verify token or fetch profile:", error);
        if (isMounted) {
            logout(false); // Token is invalid or API error, log out without navigating
        }
      } finally {
          // Always set loading to false after attempt, even on error
          if (isMounted) setIsLoading(false);
      }
    };
    
    initializeAuth();

    return () => {
        isMounted = false; // Cleanup function to set the flag on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependency array includes logout which includes navigate

  // --- Login Function --- 
  const login = useCallback(async (credentials) => {
    try {
      const data = await loginUser(credentials);
      if (data.token) {
        setToken(data.token);
        setUser(data.user || null); // Store user info from login response
        localStorage.setItem('authToken', data.token);
        // Optional: Store user info in localStorage
        // if (data.user) localStorage.setItem('userInfo', JSON.stringify(data.user));
        setIsAuthenticated(true);
        navigate('/', { replace: true }); 
      } else {
        throw new Error('Login failed: No token received.');
      }
    } catch (error) {
      console.error('AuthContext login error:', error);
      logout(false); // Ensure cleanup on failed login, don't navigate
      throw error; 
    }
  }, [navigate, logout]); // Add logout as dependency

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