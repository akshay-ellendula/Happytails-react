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
  const [user, setUser] = useState(null); // { role: 'customer' | 'eventManager' | 'admin' | 'storePartner', ... }
  const [loading, setLoading] = useState(true);

  // Endpoints configuration
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

  // 1. Verify Auth on Mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await axiosInstance.get('/auth/verify');
        if (res.data.authenticated) {
          setUser({ role: res.data.role });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth verification failed", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  // 2. Unified Sign In
  const signin = async (credentials, role = 'customer') => {
    setLoading(true);
    try {
      const endpoint = authConfig[role]?.signin;
      if (!endpoint) throw new Error('Invalid role');

      const res = await axiosInstance.post(endpoint, credentials);
      
      if (res.data.success) {
        setUser({ role }); // Update global state immediately
        return { success: true, role };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || "Login failed" 
      };
    } finally {
      setLoading(false);
    }
  };

  // 3. Unified Sign Up
  const signup = async (data, role = 'customer') => {
    setLoading(true);
    try {
      const endpoint = authConfig[role]?.signup;
      if (!endpoint) throw new Error('Invalid role');

      const res = await axiosInstance.post(endpoint, data);
      
      if (res.data.success) {
        setUser({ role });
        return { success: true, role };
      }
      return { success: false, error: res.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || "Registration failed" 
      };
    } finally {
      setLoading(false);
    }
  };

  // 4. Sign Out
  const signout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
      setUser(null);
      // Optional: Redirect logic is usually handled in the component calling signout
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, signout }}>
      {children}
    </AuthContext.Provider>
  );
};