import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

const ServiceProviderLogin = () => {
  const navigate = useNavigate();
  const { signin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) return toast.error("Please select your role");

    setLoading(true);

    // 1. Map dropdown value to AuthContext keys
    const roleKey =
      formData.role === "event-manager" ? "eventManager" : "storePartner";

    // 2. Call signin
    const result = await signin(
      {
        email: formData.email,
        password: formData.password,
      },
      roleKey
    ); // Pass the correct role key

    setLoading(false);

    if (result.success) {
      toast.success("Login successful!");
      // 3. Redirect based on role
      if (roleKey === "eventManager") navigate("/eventManager");
      else if (roleKey === "storePartner") navigate("/shop");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#effe8b] font-outfit flex flex-col">
      <nav className="w-full p-6 flex justify-center sm:justify-start">
        <header>
          <a
            href="/"
            className="text-3xl font-bold text-[#1a1a1a] no-underline hover:scale-105 transition-transform inline-block"
          >
            Happy Tails
          </a>
        </header>
      </nav>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-4 border-[#1a1a1a]">
          <h1 className="text-3xl font-bold text-[#1a1a1a] text-center mb-8">
            Service Provider Login
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#effe8b] focus:ring-2 focus:ring-[#effe8b]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#effe8b] focus:ring-2 focus:ring-[#effe8b]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600">
                Role
              </label>
              <div className="relative">
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl appearance-none focus:outline-none focus:border-[#effe8b] focus:ring-2 focus:ring-[#effe8b] cursor-pointer"
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="event-manager">Event Manager</option>
                  <option value="storePartner">Store Partner</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 py-4 bg-[#1a1a1a] text-white font-bold rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 border-[#1a1a1a] ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
      <footer className="p-6 text-center text-[#1a1a1a] font-medium bg-[#effe8b]">
        &copy; 2025 Happy Tails. All rights reserved.
      </footer>
    </div>
  );
};

export default ServiceProviderLogin;
