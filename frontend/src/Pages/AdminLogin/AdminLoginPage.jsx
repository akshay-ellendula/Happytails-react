import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    const result = await signin({ email, password }, "admin");

    if (result.success) {
      toast.success("Login Successful");
      navigate("/admin/dashboard");
    } else {
      toast.error(result.error || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff9c4] to-[#effe8b] font-outfit flex flex-col">
      {/* Navbar */}
      <div className="px-6 py-4 md:px-10 md:py-5">
        <header className="flex items-center justify-between">
          <a
            href="/"
            className="text-2xl md:text-3xl font-bold text-gray-800 hover:scale-105 transition-transform duration-200"
          >
            Happy Tails
          </a>
        </header>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        {/* Login Container */}
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h1>
            <p className="text-gray-600">Welcome back to Happy Tails Admin Panel</p>
          </div>



          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@happytails.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </form>


        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="h-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400"></div>
    </div>
  );
};

export default AdminLoginPage;