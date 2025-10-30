import React from 'react';
import { Mail, Lock, User, Sparkles, Hand } from 'lucide-react';
import FormInput from './FormInput';

const AuthForm = ({
  isSignIn,
  formData,
  onChange,
  onSubmit,
  onToggleMode,
  onForgotPassword,
  loading,
}) => {
  return (
    <div className="flex flex-col items-center justify-center transition-all duration-500 opacity-100">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-[#effe8b] rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-6 transition-transform">
          {isSignIn ? <Hand size={32} /> : <Sparkles size={32} />}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a]">
          {isSignIn ? 'Welcome Back!' : 'Create Account'}
        </h1>
        <p className="text-gray-500 mt-2">
          {isSignIn ? 'Sign in to continue your journey' : 'Join our community today!'}
        </p>
      </div>

      {!isSignIn && (
        <FormInput
          name="userName"
          placeholder="Full name"
          value={formData.userName}
          onChange={onChange}
          icon={User}
        />
      )}

      <FormInput
        type="email"
        name="email"
        placeholder="Email address"
        value={formData.email}
        onChange={onChange}
        icon={Mail}
      />

      <FormInput
        type="password"
        name="password"
        placeholder={isSignIn ? "Password" : "Password (min. 6 characters)"}
        value={formData.password}
        onChange={onChange}
        icon={Lock}
      />

      {isSignIn && (
        <a
          href="#forgot"
          className="text-sm text-[#1a1a1a] font-semibold my-4 hover:text-gray-600 transition-colors no-underline hover:underline"
          onClick={onForgotPassword}
        >
          Forgot your password?
        </a>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className={`w-full cursor-pointer rounded-xl text-sm font-bold px-8 py-4 mt-4 uppercase tracking-wider transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-opacity-50 border-2 border-black ${
          isSignIn
            ? 'bg-[#effe8b] Wtext-[#1a1a1a] focus:ring-[#effe8b]'
            : 'bg-[#1a1a1a] text-white hover:bg-gray-800 focus:ring-[#1a1a1a]'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Please wait...' : (isSignIn ? 'Sign In' : 'Create Account')}
      </button>

      <div className="mt-6 text-sm text-gray-500">
        {isSignIn ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-[#1a1a1a] font-bold hover:underline"
        >
          {isSignIn ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;