import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { PawPrint } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import AuthForm from "./components/AuthForm";

function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [signupInput, setSignupInput] = useState({ userName: "", email: "", password: "" });

  const { signin, signup, loading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'customer') navigate('/');
      else if (user.role === 'eventManager') navigate('/eventManager');
      else if (user.role === 'storePartner') navigate('/store');
      else if (user.role === 'admin') navigate('/admin');
    }
  }, [user, navigate]);

  const handleInputChange = (e, isLogin) => {
    const { name, value } = e.target;
    if (isLogin) {
      setLoginInput((prev) => ({ ...prev, [name]: value }));
    } else {
      setSignupInput((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ... validateForm function remains the same ...
  const validateForm = (isLogin) => {
    const data = isLogin ? loginInput : signupInput;
    if (!isLogin && (!data.userName || data.userName.trim().length < 2)) {
      toast.error("Please enter a valid name");
      return false;
    }
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
    if (!validateForm(true)) return;

    // Explicitly pass 'customer' role
    const result = await signin(loginInput, 'customer');
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) return;

    // Explicitly pass 'customer' role
    const result = await signup(signupInput, 'customer');
    
    if (result.success) {
      toast.success('Registration successful!');
      navigate('/');
    } else {
      toast.error(result.error || 'Signup failed');
    }
  };

  // ... Rest of the JSX remains the same ...
  // (Just make sure to pass the updated handlers to AuthForm)
  return (
    <div className="min-h-screen bg-[#effe8b]" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* ... Background divs ... */}
      
      <nav className="relative z-10 mx-5 sm:mx-20 lg:mx-20">
        <header className="flex justify-between items-center p-4 sm:p-6 lg:p-8">
          <a href="/" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a] hover:scale-110 transition-transform no-underline flex items-center gap-2">
            <PawPrint size={32} />
            <span className="bg-[#1a1a1a] bg-clip-text text-transparent">Happy Tails</span>
          </a>
        </header>
      </nav>

      <div className="relative z-10 bg-white rounded-3xl shadow-2xl overflow-hidden w-11/12 sm:w-[480px] max-w-full min-h-[580px] mx-auto my-12 border-4 border-black">
        {/* Toggle Buttons */}
        <div className="relative flex bg-[#1a1a1a] p-2">
          <div className={`absolute top-2 bottom-2 w-1/2 bg-[#effe8b] rounded-xl transition-all duration-300 ease-in-out ${isSignIn ? "left-2" : "left-1/2 -ml-1"}`}></div>
          <button type="button" className={`relative z-10 flex-1 text-base font-bold py-3 cursor-pointer transition-all rounded-xl ${isSignIn ? "text-[#1a1a1a]" : "text-[#effe8b] hover:text-white"}`} onClick={() => setIsSignIn(true)}>Sign In</button>
          <button type="button" className={`relative z-10 flex-1 text-base font-bold py-3 cursor-pointer transition-all rounded-xl ${!isSignIn ? "text-[#1a1a1a]" : "text-[#effe8b] hover:text-white"}`} onClick={() => setIsSignIn(false)}>Sign Up</button>
        </div>

        <div className="px-8 sm:px-12 py-8 text-center bg-white">
          <AuthForm
            isSignIn={isSignIn}
            formData={isSignIn ? loginInput : signupInput}
            onChange={(e) => handleInputChange(e, isSignIn)}
            onSubmit={isSignIn ? handleLoginSubmit : handleSignupSubmit}
            onToggleMode={() => setIsSignIn(!isSignIn)}
            // ... pass other props ...
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}

export default AuthPage;