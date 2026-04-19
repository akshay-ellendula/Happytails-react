import React, { useState } from 'react';
import { Link } from 'react-router';
import { axiosInstance } from '../../utils/axios';
import { toast } from 'react-hot-toast';
import projectLogo from '../../assets/projectLogo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("customer"); // Default role
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Send role along with email
            await axiosInstance.post("/auth/forgotpassword", { email, role });
            toast.success(`Reset link sent to your ${role} email!`);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] font-outfit flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#f2c737] selection:text-black">
            {/* Ambient Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-b from-[#f2c737]/5 to-transparent blur-[120px] -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-t from-[#f2c737]/5 to-transparent blur-[100px] translate-y-1/2" />
            </div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <img src={projectLogo} alt="Logo" className="h-24 w-auto drop-shadow-[0_0_15px_rgba(242,199,55,0.2)]" />
                </div>
                <h2 className="mt-2 text-center text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
                    Forgot Password
                </h2>
                <p className="mt-2 text-center text-sm font-medium text-white/50">
                    Select your account type and enter your email.
                </p>
            </div>

            <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#0d0d0d]/80 backdrop-blur-xl py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)] sm:rounded-3xl sm:px-10 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
                    <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                        
                        {/* Role Selection */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-bold text-white/90 uppercase tracking-wider mb-2">
                                Account Type
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-3 text-base bg-[#1a1a1a] text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#f2c737]/50 focus:border-[#f2c737] sm:text-sm rounded-xl transition-all"
                            >
                                <option value="customer" className="bg-[#1a1a1a]">Customer</option>
                                <option value="eventManager" className="bg-[#1a1a1a]">Event Manager</option>
                                <option value="vendor" className="bg-[#1a1a1a]">Store Partner (Vendor)</option>
                            </select>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-white/90 uppercase tracking-wider mb-2">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f2c737]/50 focus:border-[#f2c737] sm:text-sm transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-black text-black bg-[#f2c737] hover:bg-[#f2c737]/90 hover:shadow-[0_0_20px_rgba(242,199,55,0.4)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f2c737] focus:ring-offset-[#0d0d0d] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center relative z-10 border-t border-white/10 pt-6">
                        <Link to="/login" className="font-bold text-white/60 hover:text-[#f2c737] transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;