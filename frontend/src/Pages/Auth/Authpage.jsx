import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { PawPrint } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import GoogleLoginButton from '../../components/GoogleLoginButton';

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
      if (user.role === "customer") navigate("/");
      else if (user.role === "eventManager") navigate("/eventManager");
      else if (user.role === "storePartner") navigate("/shop");
      else if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/"); // Fallback
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
    const result = await signin(loginInput, "customer");

    if (result && result.success) {
      toast.success("Login successful!");
      // Navigation handled by useEffect
    } else {
      toast.error(result?.error || "Login failed");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) {
      return;
    }

    // Explicitly pass 'customer' role
    const result = await signup(signupInput, "customer");

    if (result && result.success) {
      toast.success("Registration successful!");
      // Navigation handled by useEffect
    } else {
      toast.error(result?.error || "Signup failed");
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const email = loginInput.email.trim();
    // If valid, redirect to forgot password page
    // We pass the email in state so it can be pre-filled if you want to update ForgotPassword page later
    navigate("/forgot-password", { state: { email } });
  };

  return (
    <div
      className="min-h-screen bg-[#1a1a1a] flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Animated gradient orbs (Theme matching) */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#f2c737]/15 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#f2c737]/10 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Navbar */}
      <nav className="relative z-10 w-full mb-4">
        <header className="flex justify-center sm:justify-start items-center p-6 sm:px-12 pt-8">
          <a
            href="/"
            className="text-3xl font-black text-white hover:scale-105 transition-transform no-underline flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-[#f2c737] rounded-xl flex items-center justify-center">
              <PawPrint className="text-[#1a1a1a] w-6 h-6" />
            </div>
            <span>HappyTails</span>
          </a>
        </header>
      </nav>

      {/* Container */}
      <div className="relative z-10 w-full max-w-[480px] mx-auto px-4 pb-12 flex-1 flex flex-col justify-center">

        {/* Toggle Pills - Modern Look */}
        <div className="flex bg-white/10 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl mb-6 mx-auto w-full max-w-[300px]">
          <button
            type="button"
            className={`flex-1 text-sm font-bold py-2.5 rounded-xl transition-all duration-300 ${isSignIn
                ? "bg-[#f2c737] text-[#1a1a1a] shadow-lg"
                : "text-white/70 hover:text-white"
              }`}
            onClick={() => setIsSignIn(true)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 text-sm font-bold py-2.5 rounded-xl transition-all duration-300 ${!isSignIn
                ? "bg-[#f2c737] text-[#1a1a1a] shadow-lg"
                : "text-white/70 hover:text-white"
              }`}
            onClick={() => setIsSignIn(false)}
          >
            Sign Up
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(242,199,55,0.15)] overflow-hidden w-full border border-white/20">
          <div className="px-6 sm:px-10 py-10 text-center">
            <AuthForm
              isSignIn={isSignIn}
              formData={isSignIn ? loginInput : signupInput}
              onChange={(e) => handleInputChange(e, isSignIn)}
              onSubmit={isSignIn ? handleLoginSubmit : handleSignupSubmit}
              onToggleMode={() => setIsSignIn(!isSignIn)}
              onForgotPassword={handleForgotPassword}
              loading={loading}
            />

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <div className="hover:scale-[1.02] active:scale-[0.98] transition-transform">
              <GoogleLoginButton
                role="customer"
                buttonText={isSignIn ? "Sign in with Google" : "Sign up with Google"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;