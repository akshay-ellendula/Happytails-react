import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '../utils/axios';
import { useNavigate } from 'react-router';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores { role: '...', ... }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  // We use navigate inside context for auto-redirects if needed, 
  // but usually better to handle redirects in the component calling login.
  // However, App.jsx handles the routing protection.

  // Map roles to their specific endpoints
  const apiEndpoints = {
    customer: {
      signin: '/auth/signin',
      signup: '/auth/signup',
    },
    eventManager: {
      signin: '/auth/eventManagerSignin',
      signup: '/auth/eventManagerSignup',
    },
    admin: {
      signin: '/auth/adminSignin',
      signup: '/auth/adminSignup',
    },
    storePartner: {
      signin: '/auth/storeSignin',
      signup: '/auth/storeSignup',
    }
  };

  // Check authentication status on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axiosInstance.get('/auth/verify');
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          setUser({ role: response.data.role });
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.log('User not authenticated');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const signin = async (userData, role = 'customer') => {
    setLoading(true);
    try {
      const endpoint = apiEndpoints[role]?.signin;
      if (!endpoint) throw new Error('Invalid role specified');

      const response = await axiosInstance.post(endpoint, userData);
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUser({ role }); // Set the role immediately upon success
        return { success: true, role };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Signin error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData, role = 'customer') => {
    setLoading(true);
    try {
      const endpoint = apiEndpoints[role]?.signup;
      if (!endpoint) throw new Error('Invalid role specified');

      const response = await axiosInstance.post(endpoint, userData);
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUser({ role });
        return { success: true, role };
      }
      return { success: false, error: 'Registration failed' };
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
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
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