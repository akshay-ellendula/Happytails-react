import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ServiceProviderLogin = () => {
  const navigate = useNavigate();
  // Use the signin function from context to ensure state updates
  const { signin } = useAuth(); 

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '' // 'event-manager' or 'store-manager'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.role) {
      toast.error("Please select your role");
      return;
    }

    setLoading(true);

    try {
      // Map the dropdown values to the specific roles used in AuthContext
      const roleMapping = {
        'event-manager': 'eventManager', // Matches key in AuthContext apiEndpoints
        'store-manager': 'storePartner'  // Matches key in AuthContext apiEndpoints
      };

      const authRole = roleMapping[formData.role];

      // Call signin from useAuth. This updates isAuthenticated = true globally.
      const result = await signin({
        email: formData.email,
        password: formData.password
      }, authRole);

      if (result.success) {
        toast.success('Login successful!');
        
        // Determine redirect path based on the actual authenticated role
        if (authRole === 'eventManager') {
          navigate('/eventManager');
        } else if (authRole === 'storePartner') {
          navigate('/store');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.error || 'Login failed');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#effe8b] font-outfit flex flex-col">
      <Toaster position="top-center" />

      {/* Navbar Section */}
      <nav className="w-full p-6 flex justify-center sm:justify-start">
        <header>
           <a href="/" className="text-3xl font-bold text-[#1a1a1a] no-underline hover:scale-105 transition-transform inline-block">
             Happy Tails
           </a>
        </header>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-4 border-[#1a1a1a]">
          
          {/* Header */}
          <h1 className="text-3xl font-bold text-[#1a1a1a] text-center mb-8">
            Service Provider Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-600">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#effe8b] focus:ring-2 focus:ring-[#effe8b] transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-600">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#effe8b] focus:ring-2 focus:ring-[#effe8b] transition-all"
              />
            </div>

            {/* Role Selection */}
            <div className="flex flex-col gap-2">
              <label htmlFor="role" className="text-sm font-semibold text-gray-600">
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-[#effe8b] focus:ring-2 focus:ring-[#effe8b] cursor-pointer"
                >
                  <option value="" disabled>Select your role</option>
                  <option value="event-manager">Event Manager</option>
                  <option value="store-manager">Store Manager</option>
                </select>
                {/* Custom Arrow Icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 py-4 bg-[#1a1a1a] text-white font-bold rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 border-[#1a1a1a] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-[#1a1a1a] font-medium bg-[#effe8b]">
        &copy; 2025 Happy Tails. All rights reserved.
      </footer>
    </div>
  );
};

export default ServiceProviderLogin;