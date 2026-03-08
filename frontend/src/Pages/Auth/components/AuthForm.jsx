import React from 'react';
import { Loader2 } from 'lucide-react';

const AuthForm = ({ 
  isSignIn, 
  formData, 
  onChange, 
  onSubmit, 
  onForgotPassword, 
  loading 
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-left">
      <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-2">
        {isSignIn ? "Welcome Back!" : "Create Account"}
      </h2>
      <p className="text-gray-500 mb-6">
        {isSignIn 
          ? "Enter your details to access your account" 
          : "Join our community of pet lovers today"}
      </p>

      {/* Username Field - Only for Sign Up */}
      {!isSignIn && (
        <div className="group">
          <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="userName"
            placeholder="John Doe"
            value={formData.userName}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1a1a1a] focus:outline-none transition-colors font-medium"
            required={!isSignIn}
          />
        </div>
      )}

      {/* Email Field */}
      <div className="group">
        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="you@gmail.com"
          value={formData.email}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1a1a1a] focus:outline-none transition-colors font-medium"
          required
        />
      </div>

      {/* Password Field */}
      <div className="group">
        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={onChange}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-100 focus:border-[#1a1a1a] focus:outline-none transition-colors font-medium"
          required
          minLength={6}
        />
      </div>

      {/* Forgot Password Link - Only for Sign In */}
      {isSignIn && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-bold text-gray-400 hover:text-[#1a1a1a] transition-colors"
          >
            Forgot Password?
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1a1a1a] text-white font-bold py-4 rounded-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="animate-spin" size={20} />}
        {isSignIn ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
};

export default AuthForm;