import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { PawPrint } from "lucide-react";
import GoogleLoginButton from "../../components/GoogleLoginButton";

const ServiceProviderLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signin, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  // Handle Google login success/error from URL params
  useEffect(() => {
    const googleSuccess = searchParams.get('google_login_success');
    const googleError = searchParams.get('error');

    if (googleSuccess === 'true') {
      toast.success('Google login successful!');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (googleError === 'google_auth_failed') {
      toast.error('Google login failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === "eventManager") {
        navigate("/eventManager");
      } else if (user.role === "vendor") {
        navigate("/shop");
      }
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) return toast.error("Please select your role");

    setLoading(true);

    const roleKey =
      formData.role === "event-manager" ? "eventManager" : "vendor";

    const result = await signin(
      {
        email: formData.email,
        password: formData.password,
      },
      roleKey
    );

    setLoading(false);

    if (result.success) {
      toast.success("Login successful!");
      if (roleKey === "eventManager") navigate("/eventManager");
      else if (roleKey === "vendor") navigate("/shop");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  // Determine role for Google login
  const getGoogleRole = () => {
    if (formData.role === "event-manager") return "eventManager";
    if (formData.role === "storePartner") return "vendor";
    return "";
  };

  return (
    <div
      className="min-h-screen bg-[#1a1a1a] flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Animated gradient orbs (matching customer login) */}
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

        {/* Card */}
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(242,199,55,0.15)] overflow-hidden w-full border border-white/20">
          <div className="px-6 sm:px-10 py-10">
            
            <h1 className="text-2xl font-bold text-[#1a1a1a] text-center mb-2">
              Service Provider Login
            </h1>
            <p className="text-gray-400 text-sm text-center mb-8">
              Access your Event Manager or Store Partner dashboard
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#f2c737] focus:ring-2 focus:ring-[#f2c737]/30 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#f2c737] focus:ring-2 focus:ring-[#f2c737]/30 transition-all"
                />
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-medium text-[#f2c737] hover:text-[#d4a620] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-600">
                  Role
                </label>
                <div className="relative">
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-[#f2c737] focus:ring-2 focus:ring-[#f2c737]/30 cursor-pointer transition-all"
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    <option value="event-manager">Event Manager</option>
                    <option value="storePartner">Store Partner</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-2 py-4 bg-[#1a1a1a] text-white font-bold rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button - Only show if role is selected */}
            {formData.role ? (
              <div className="hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <GoogleLoginButton
                  role={getGoogleRole()}
                  buttonText={`Continue with Google as ${formData.role === "event-manager" ? "Event Manager" : "Store Partner"}`}
                />
              </div>
            ) : (
              <div className="text-center text-sm text-gray-400">
                Select a role to continue with Google
              </div>
            )}

            <div className="text-center mt-6 text-gray-400 text-sm">
              Customer? <a href="/login" className="text-[#f2c737] hover:text-[#d4a620] font-semibold transition-colors">Login here</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderLogin;