import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../../utils/axios';
import { toast } from 'react-hot-toast';
import projectLogo from '../../assets/projectLogo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.post("/auth/forgotpassword", { email });
            toast.success("Email sent! Check your inbox.");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        setLoading(false);
    };

    return (
        // Updated background color and font family
        <div className="min-h-screen bg-[#effe8b] font-outfit flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Added Logo */}
                <div className="flex justify-center mb-6">
                    <img 
                        src={projectLogo} 
                        alt="Happy Tails Logo" 
                        className="h-24 w-auto drop-shadow-md"
                    />
                </div>

                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                    Forgot Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-700">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-[#effe8b]">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    // Updated focus ring color to match theme
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link 
                                to="/login" 
                                className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;