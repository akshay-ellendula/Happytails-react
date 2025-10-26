import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Use useNavigate for client-side routing
import { useAuth } from "../../hooks/useAuth"; // Import Auth Context
import { toast } from "react-hot-toast"; // Use toast for consistent UI

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signin } = useAuth(); // Get signin function from context
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
    <div className="min-h-screen bg-[#effe8b] font-outfit">
      {/* Navbar */}
      <div className="px-10 py-5">
        <header className="flex items-center justify-between">
          <a
            href="/"
            className="text-3xl font-semibold hover:scale-110 transition"
          >
            Happy Tails
          </a>
        </header>
      </div>

      {/* Container */}
      <div className="bg-white w-[400px] mx-auto mt-10 p-10 rounded-xl shadow-xl">
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>

          <div className="flex my-4">
            <a className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mx-2 cursor-pointer">
              <img
                src="/icons/google-logo-search-new-svgrepo-com.svg"
                alt="google"
                className="h-7"
              />
            </a>
            <a className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mx-2 cursor-pointer">
              <img
                src="/icons/facebook-3-logo-svgrepo-com.svg"
                alt="facebook"
                className="h-7"
              />
            </a>
          </div>

          <span className="text-gray-500 text-xs mb-4">
            or use your account
          </span>

          <input
            type="email"
            placeholder="Email"
            className="w-full bg-gray-200 p-3 rounded-md mb-3 focus:ring-2 focus:ring-black outline-none text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-200 p-3 rounded-md mb-3 focus:ring-2 focus:ring-black outline-none text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <a href="#" className="text-sm mb-3 text-black hover:opacity-70">
            Forgot your password?
          </a>

          <button
            type="submit"
            className="bg-black text-white px-10 py-3 rounded-full text-xs font-semibold uppercase hover:bg-gray-800 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
