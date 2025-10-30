// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Since JWT is in httpOnly cookie, we need an endpoint to verify auth
        // Add this endpoint to your backend: /api/auth/verify
        const response = await axiosInstance.get('/auth/verify');
        setIsAuthenticated(response.data.authenticated);
      } catch (error) {
        console.log('User not authenticated or verification failed');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signin = async (userData) => {
    setLoading(true);
    try {
      console.log('Making signin request with:', userData);
      const response = await axiosInstance.post('/auth/signin', userData);
      console.log('Signin response:', response.data);
      
      // If we reach here, the request was successful and cookie is set
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Signin error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      console.log('Making signup request with:', userData);
      const response = await axiosInstance.post('/auth/signup', userData);
      console.log('Signup response:', response.data);
      
      // If we reach here, the request was successful and cookie is set
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always set authenticated to false on logout
      setIsAuthenticated(false);
    }
  };

  const value = {
    isAuthenticated,
    loading,
    signin,
    signup,
    signout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};