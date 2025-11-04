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
  const [user, setUser] = useState(null); // UPDATED: Add user state
  const [loading, setLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axiosInstance.get('/auth/verify');
        setIsAuthenticated(response.data.authenticated);
        if (response.data.authenticated) {
            setUser(response.data.user); // UPDATED: Set user
        }
      } catch (error) {
        console.log('User not authenticated or verification failed');
        setIsAuthenticated(false);
        setUser(null); // UPDATED: Ensure user is null
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
      
      setIsAuthenticated(true);
      setUser(response.data.user); // UPDATED: Set user from response
      
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
      
      setIsAuthenticated(true);
      setUser(response.data.user); // UPDATED: Set user from response
      
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
      setIsAuthenticated(false);
      setUser(null); // UPDATED: Clear user on logout
    }
  };

  const value = {
    isAuthenticated,
    loading,
    user, // UPDATED: Provide user in context
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