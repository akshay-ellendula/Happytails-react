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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Role-based endpoint configuration
  const authConfig = {
    customer: {
      signin: '/auth/signin',
      signup: '/auth/signup',
    },
    eventManager: {
      signin: '/auth/eventManagerSignin',
      signup: '/auth/eventManagerSignup',
    },
    storePartner: {
      signin: '/auth/storeSignin',
      signup: '/auth/storeSignup',
    },
    admin: {
      signin: '/auth/adminSignin',
      signup: '/auth/adminSignup',
    }
  };

  // 1. Check Auth Status on Mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axiosInstance.get('/auth/verify');
        console.log(response.data)
        
        setIsAuthenticated(response.data.authenticated);
        
        if (response.data.authenticated && response.data.user) {
            setUser(response.data.user);
        }
      } catch (error) {
        console.log('User not authenticated or verification failed');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 2. Update Local User State (for Profile updates)
  const updateUser = (newUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...newUserData
    }));
  };

  // 3. Unified Sign In
  const signin = async (userData, role = 'customer') => {
    setLoading(true);
    try {
      // Get the correct endpoint based on role
      const endpoint = authConfig[role]?.signin || authConfig.customer.signin;
      
      const response = await axiosInstance.post(endpoint, userData);

      // Special logic for Customers: Fetch full profile details
      if (role === 'customer' && response.data.user?.customerId) {
        const id = response.data.user.customerId;
        try {
           const fullUserResponse = await axiosInstance.get(`/public/${id}`);
           setUser(fullUserResponse.data);
        } catch (fetchError) {
           console.error("Could not fetch full user details, using basic info", fetchError);
           setUser(response.data.user);
        }
      } else {
        // For Admin, Event Managers, etc., use the data returned from login
        setUser(response.data.user);
      }

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

  // 4. Unified Sign Up
  const signup = async (userData, role = 'customer') => {
    setLoading(true);
    try {
      const endpoint = authConfig[role]?.signup || authConfig.customer.signup;
      
      const response = await axiosInstance.post(endpoint, userData);

      // Similar fetch logic for signup if backend returns ID immediately
      if (role === 'customer' && response.data.user?.customerId) {
         const id = response.data.user.customerId;
         const fullUserResponse = await axiosInstance.get(`/public/${id}`);
         setUser(fullUserResponse.data);
      } else {
         setUser(response.data.user);
      }

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

  // 5. Sign Out
  const signout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    signin,
    signup,
    signout,
    updateUser,
  };
  

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};