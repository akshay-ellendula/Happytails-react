import { useState } from 'react';
import toast from 'react-hot-toast';
import { axiosInstance } from '../utils/axios'; 

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const signup = async (userData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/signup', userData);
      toast.success('Registration successfull!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signin = async (userData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/signin', userData);
      toast.success('Login successful! Redirecting...');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    signup,
    signin,
    loading,
  };
};