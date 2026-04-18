import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    // Add title
    useEffect(() => {
        document.title = "404 - Page Not Found | HappyTails";
        return () => document.title = "HappyTails";
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1a1a] flex flex-col justify-center items-center p-6 relative overflow-hidden font-outfit">
            {/* Animated Background Elements */}
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#f2c737]/15 blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-[#f2c737]/10 blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }}
            ></div>

            {/* Main Content Card */}
            <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_60px_rgba(242,199,55,0.15)] border border-white/20 p-10 sm:p-14 text-center">
                
                {/* 404 Display */}
                <div className="relative mb-6">
                    <h1 className="text-[100px] sm:text-[120px] font-black text-[#f2c737] leading-none tracking-tighter drop-shadow-sm">
                        4<span className="inline-block animate-bounce">🐾</span>4
                    </h1>
                </div>

                <div className="space-y-4 mb-10">
                    <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] tracking-tight">
                        Oops! You're Off the Leash
                    </h2>
                    <p className="text-gray-500 font-medium text-sm sm:text-base px-4">
                        The page you are looking for seems to have wandered away or might not exist anymore. 
                        Let's get you back home!
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 bg-gray-50 border-2 border-gray-100 text-[#1a1a1a] font-bold py-3.5 px-6 rounded-xl hover:bg-gray-100 hover:border-gray-200 transition-all duration-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                    
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 bg-[#f2c737] text-[#1a1a1a] font-black py-3.5 px-6 rounded-xl hover:shadow-[0_8px_20px_rgba(242,199,55,0.3)] hover:-translate-y-0.5 active:translate-y-0 border border-[#f2c737]/20 transition-all duration-300"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Bottom floating elements */}
            <div className="absolute bottom-8 text-center text-[#f2c737]/20 flex gap-4">
                <span className="text-3xl animate-pulse" style={{ animationDelay: '0s' }}>🐕</span>
                <span className="text-3xl animate-pulse -translate-y-4" style={{ animationDelay: '0.5s' }}>🐈</span>
                <span className="text-3xl animate-pulse" style={{ animationDelay: '1s' }}>🎾</span>
            </div>
        </div>
    );
};

export default NotFound;
