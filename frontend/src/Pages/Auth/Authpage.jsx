import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { PawPrint } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import AuthForm from "./components/AuthForm";

function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [signupInput, setSignupInput] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const { signin, signup, loading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect based on role if user is already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'customer') navigate('/');
      else if (user.role === 'eventManager') navigate('/eventManager');
      else if (user.role === 'storePartner') navigate('/store');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/'); // Fallback
    }
  }, [user, navigate]);

  // Clear inputs when toggling mode
  useEffect(() => {
    if (isSignIn) {
      setLoginInput({ email: "", password: "" });
    } else {
      setSignupInput({ userName: "", email: "", password: "" });
    }
  }, [isSignIn]);

  const handleInputChange = (e, isLogin) => {
    const { name, value } = e.target;
    if (isLogin) {
      setLoginInput((prev) => ({ ...prev, [name]: value }));
    } else {
      setSignupInput((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (isLogin) => {
    const data = isLogin ? loginInput : signupInput;
    if (!isLogin && (!data.userName || data.userName.trim().length < 2)) {
      toast.error("Please enter a valid name (at least 2 characters)");
      return false;
    }
    // Strict Gmail validation as requested
    if (!data.email || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(data.email)) {
      toast.error("Please enter a valid Gmail address");
      return false;
    }
    if (!data.password || data.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) {
      return;
    }
    
    // Explicitly pass 'customer' role
    const result = await signin(loginInput, 'customer');
    
    if (result && result.success) {
      toast.success('Login successful!');
      // Navigation handled by useEffect
    } else {
      console.log('Signin failed:', result);
      toast.error(result?.error || 'Login failed');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) {
      return;
    }

    // Explicitly pass 'customer' role
    const result = await signup(signupInput, 'customer');

    if (result && result.success) {
      toast.success('Registration successful!');
      // Navigation handled by useEffect
    } else {
      console.log('Signup failed:', result);
      toast.error(result?.error || 'Signup failed');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const email = loginInput.email.trim();
    if (!email || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      toast.error("Please enter your Gmail address first");
      return;
    }
    toast.success("Password reset link sent!");
  };

  return (
    <div
      className="min-h-screen bg-[#effe8b]"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 mx-5 sm:mx-20 lg:mx-20">
        <header className="flex justify-between items-center p-4 sm:p-6 lg:p-8">
          <a
            href="/"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a] hover:scale-110 transition-transform no-underline flex items-center gap-2"
          >
            <PawPrint size={32} />
            <span className="bg-[#1a1a1a] bg-clip-text text-transparent">
              Happy Tails
            </span>
          </a>
        </header>
      </nav>

      {/* Container */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden w-11/12 sm:w-[480px] max-w-full min-h-[580px] mx-auto my-12 border-4 border-black">
        {/* Toggle Container */}
        <div className="relative flex bg-[#1a1a1a] p-2">
          <div
            className={`absolute top-2 bottom-2 w-1/2 bg-[#effe8b] rounded-xl transition-all duration-300 ease-in-out ${
              isSignIn ? "left-2" : "left-1/2 -ml-1"
            }`}
          ></div>
          <button
            type="button"
            className={`relative z-10 flex-1 text-base font-bold py-3 cursor-pointer transition-all rounded-xl ${
              isSignIn ? "text-[#1a1a1a]" : "text-[#effe8b] hover:text-white"
            }`}
            onClick={() => setIsSignIn(true)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`relative z-10 flex-1 text-base font-bold py-3 cursor-pointer transition-all rounded-xl ${
              !isSignIn ? "text-[#1a1a1a]" : "text-[#effe8b] hover:text-white"
            }`}
            onClick={() => setIsSignIn(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Form Container */}
        <div className="px-8 sm:px-12 py-8 text-center bg-white">
          <AuthForm
            isSignIn={isSignIn}
            formData={isSignIn ? loginInput : signupInput}
            onChange={(e) => handleInputChange(e, isSignIn)}
            onSubmit={isSignIn ? handleLoginSubmit : handleSignupSubmit}
            onToggleMode={() => setIsSignIn(!isSignIn)}
            onForgotPassword={handleForgotPassword}
            loading={loading}
          />
        </div>
      </div>

      {/* Add animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
        
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default AuthPage;