// ProductAccessoryPageWrapper.jsx
import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axios"; // Adjust path if needed
import ProductAccessoryPage from "./ProductAccessoryPage";
import { useAuth } from "../../hooks/useAuth"; // UPDATED: Import useAuth

const ProductAccessoryPageWrapper = () => {
  const { user } = useAuth(); // UPDATED: Get the logged-in user from context
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true); // Start loading
      setError(null); // Clear previous errors
      try {
        // Fetch from the API endpoint
        const response = await axiosInstance.get("/products/getProducts");
        console.log("API Response:", response.data); // Debug log
        if (response.data.success) {
          setPageData({
            // UPDATED: Removed 'user' from here. We get it from useAuth now.
            // user: response.data.user,
            productsData: response.data.products || [],
            // Ensure filters has a default structure
            filters: response.data.filters || {
              maxPrice: 0,
              productTypes: [],
              colors: [],
              sizes: [],
            },
          });
        } else {
          setError("Failed to load product data from the server.");
          console.error("API Error:", response.data.message);
        }
      } catch (err) {
        setError(
          `Network error: ${err.message}. Could not connect to the backend.`
        );
        console.error("Network error:", err);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchProductData();
  }, []); // Empty array ensures this runs only once when the component mounts

  const [loadingText, setLoadingText] = useState("Fetching best accessories...");

  // Cycle through fun pet-themed loading texts
  useEffect(() => {
    if (!isLoading) return;
    const texts = [
      "Fetching best accessories...",
      "Sniffing out great deals...",
      "Organizing squeaky toys...",
      "Packing up the treats...",
      "Almost ready to wag! 🐾"
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // --- Render loading/error states ---
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#1a1a1a] flex flex-col items-center justify-center overflow-hidden font-outfit">
        
        {/* Animated glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#f2c737]/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#f2c737]/10 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Floating paws pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
          backgroundSize: '40px 40px' 
        }}></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Paw bouncing animation */}
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
             <div className="absolute inset-0 bg-[#f2c737] rounded-full animate-ping opacity-20"></div>
             <div className="absolute inset-2 bg-[#f2c737] rounded-full animate-pulse opacity-40"></div>
             <div className="relative z-10 w-20 h-20 bg-[#f2c737] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(242,199,55,0.6)] animate-bounce">
                <span className="text-4xl">🐾</span>
             </div>
          </div>

          {/* Glowing Text */}
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
            Hang tight!
          </h2>
          
          {/* Typewriter/Fading Fun Text */}
          <p className="text-[#f2c737] font-bold text-lg sm:text-xl h-8 animate-pulse transition-all duration-500">
            {loadingText}
          </p>

          {/* Progress Bar Container */}
          <div className="mt-12 w-64 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5 relative">
            {/* Animated infinite loading bar */}
            <div className="absolute top-0 left-0 h-full bg-[#f2c737] rounded-full shadow-[0_0_15px_rgba(242,199,55,0.8)] relative w-full translate-x-[-100%] animate-[slideRight_1.5s_infinite_ease-in-out]"></div>
          </div>
        </div>

        <style>{`
          @keyframes slideRight {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6 text-center font-outfit relative">
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
         <div className="relative z-10 bg-white p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(242,199,55,0.15)] max-w-md border border-white/20">
            <div className="text-6xl mb-4">😿</div>
            <h2 className="text-3xl font-black text-[#1a1a1a] mb-2 tracking-tight">Oops!</h2>
            <p className="text-gray-500 mb-8 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-[#f2c737] text-[#1a1a1a] font-black py-4 rounded-xl hover:shadow-[0_10px_30px_rgba(242,199,55,0.3)] hover:-translate-y-1 transition-all duration-300 border border-[#f2c737]/20"
            >
              Try Again
            </button>
         </div>
      </div>
    );
  }

  // Ensure pageData and essential filter data exist before rendering
  if (
    !pageData ||
    !pageData.filters ||
    typeof pageData.filters.maxPrice === "undefined"
  ) {
    console.error("Received incomplete data from backend:", pageData);
    return (
      <div>
        Error: Incomplete data received from the server. Cannot render page.
      </div>
    );
  }

  // --- Render the main page component with fetched data ---
  return (
    <ProductAccessoryPage
      user={user} // UPDATED: Pass the correct user from useAuth
      productsData={pageData.productsData}
      filters={pageData.filters}
    />
  );
};

export default ProductAccessoryPageWrapper;
