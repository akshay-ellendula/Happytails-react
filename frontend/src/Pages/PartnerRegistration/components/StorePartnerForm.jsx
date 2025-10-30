// pages/PartnerRegistration/components/StorePartnerForm.jsx
import React, { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../../../utils/axios';
import FormInput from './FormInput';

const StorePartnerForm = ({ loading, setLoading, navigate }) => {
  const [formData, setFormData] = useState({
    userName: '',
    contactnumber: '',
    email: '',
    password: '',
    confirmpassword: '',
    storename: '',
    storelocation: '',
    termsandconditions: false
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const contactRegex = /^\d{10}$/;

    if (!formData.userName.trim() || formData.userName.trim().length < 2) {
      newErrors.userName = 'Name must be at least 2 characters';
    }

    if (!contactRegex.test(formData.contactnumber)) {
      newErrors.contactnumber = 'Contact number must be 10 digits';
    }

    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid Gmail address';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmpassword) {
      newErrors.confirmpassword = 'Passwords do not match';
    }

    if (!formData.storename.trim()) {
      newErrors.storename = 'Store name is required';
    }

    if (!formData.storelocation.trim()) {
      newErrors.storelocation = 'Store location is required';
    }

    if (!formData.termsandconditions) {
      newErrors.termsandconditions = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const { confirmpassword,  ...submitData } = formData;
      const response = await axiosInstance.post('/auth/storeSignup', submitData);
      
      if (response.data.success) {
        toast.success('Store partner registration successful!');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { name: 'userName', label: 'Full Name *', type: 'text' },
    { name: 'contactnumber', label: 'Contact Number *', type: 'tel' },
    { name: 'email', label: 'Email Address *', type: 'email' },
    { name: 'storename', label: 'Store Name *', type: 'text' },
    { name: 'password', label: 'Password *', type: 'password' },
    { name: 'confirmpassword', label: 'Confirm Password *', type: 'password' },
  ];

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-yellow-400 rounded-2xl border-2 border-black flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">🏪</span>
        </div>
        <h2 className="text-3xl font-bold text-[#1a1a1a] mb-2">Store Partner Registration</h2>
        <p className="text-gray-600">Fill in your details to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formFields.map((field) => (
          <FormInput
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            value={formData[field.name]}
            error={errors[field.name]}
            onChange={handleInputChange}
          />
        ))}
        
        {/* Store Location */}
        <div className="md:col-span-2">
          <FormInput
            name="storelocation"
            label="Store Location *"
            type="text"
            value={formData.storelocation}
            error={errors.storelocation}
            onChange={handleInputChange}
          />
        </div>

        {/* Terms and Conditions */}
        <div className="md:col-span-2">
          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <input
              type="checkbox"
              name="termsandconditions"
              checked={formData.termsandconditions}
              onChange={handleInputChange}
              className="mt-1 w-5 h-5 text-[#1a1a1a] border-gray-300 rounded focus:ring-[#1a1a1a]"
            />
            <label className="text-sm text-gray-700">
              I have read and agree to the{' '}
              <Link 
                to="/terms-and-conditions" 
                className="text-[#1a1a1a] hover:underline font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms & Conditions
              </Link>
              {' '}and{' '}
              <Link 
                to="/privacy-policy" 
                className="text-[#1a1a1a] hover:underline font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </Link>
              . I wish to Register as a Store Partner.
            </label>
          </div>
          {errors.termsandconditions && (
            <div className="text-red-500 text-sm mt-1">{errors.termsandconditions}</div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 py-4 bg-[#1a1a1a] text-white rounded-xl font-semibold text-lg hover:bg-[#1a1a1a]/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Registering...' : 'Complete Store Registration'}
      </button>
    </form>
  );
};

export default StorePartnerForm;