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
        <div className="min-h-screen bg-[#effe8b] font-outfit flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <img src={projectLogo} alt="Logo" className="h-24 w-auto drop-shadow-md" />
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                    Forgot Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-700">
                    Select your account type and enter your email.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-[#effe8b]">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        
                        {/* Role Selection */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Account Type
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#effe8b] focus:border-[#effe8b] sm:text-sm rounded-md"
                            >
                                <option value="customer">Customer</option>
                                <option value="eventManager">Event Manager</option>
                                <option value="vendor">Store Partner (Vendor)</option>
                            </select>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;