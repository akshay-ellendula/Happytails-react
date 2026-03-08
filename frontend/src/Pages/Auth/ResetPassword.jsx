import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'; // Added useSearchParams
import { axiosInstance } from '../../utils/axios';
import { toast } from 'react-hot-toast';
import projectLogo from '../../assets/projectLogo.png';

const ResetPassword = () => {
    const { resetToken } = useParams();
    const [searchParams] = useSearchParams(); // Hook to read query params
    const navigate = useNavigate();
    
    // Get role from URL (?role=eventManager)
    const role = searchParams.get("role") || "customer"; 

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        
        if (password.length < 6) {
             return toast.error("Password must be at least 6 characters");
        }

        setLoading(true);
        try {
            // Pass the role in the query string to the backend
            await axiosInstance.put(`/auth/resetpassword/${resetToken}?role=${role}`, { password });
            
            toast.success("Password reset successful! Please login.");
            
            // Redirect based on role
            if (role === 'customer') {
                navigate("/login");
            } else {
                // Both Event Managers and Store Partners use the service provider login page
                navigate("/service-provider-login"); 
            }
            
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Invalid or expired token");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#effe8b] font-outfit flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <img 
                        src={projectLogo} 
                        alt="Happy Tails Logo" 
                        className="h-24 w-auto drop-shadow-md"
                    />
                </div>
                
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                    Reset Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-700">
                    Enter your new password for your <strong>{role === 'vendor' ? 'Store Partner' : role}</strong> account.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-[#effe8b]">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;