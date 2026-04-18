import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../../../context/WishlistContext";
import { useAuth } from "../../../hooks/useAuth";
import { Heart, ChevronLeft, ChevronRight, PackageX } from "lucide-react";

const ProductGrid = ({ products }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Track the current image index for each product
  const [imageIndices, setImageIndices] = useState({});

  const handleWishlistClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || user?.role !== "customer") {
      navigate("/login");
      return;
    }
    toggleWishlist(product);
  };

  const handleImageChange = (e, productId, direction, totalImages) => {
    e.preventDefault();
    e.stopPropagation();

    setImageIndices((prev) => {
      const currentIndex = prev[productId] || 0;
      let newIndex;
      if (direction === "next") {
        newIndex = (currentIndex + 1) % totalImages;
      } else {
        newIndex = (currentIndex - 1 + totalImages) % totalImages;
      }
      return { ...prev, [productId]: newIndex };
    });
  };

  const visibleProducts = products.filter((product) => product.isVisible);

  if (visibleProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-[#111]/80 backdrop-blur-xl rounded-3xl border border-white/5 w-full mt-6">
        <PackageX className="w-20 h-20 text-white/20 mb-6" />
        <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">No products found</h3>
        <p className="text-white/40 text-center max-w-sm">We couldn't find any items matching your exact filters. Try adjusting them to explore more of our collection.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {visibleProducts.map((product, index) => {
        const pid = product.id?.toString() || product._id?.toString();
        const wishlisted = isWishlisted(pid);

        // Images array
        const images = product.images && product.images.length > 0
          ? product.images.map((img) => img.image_data)
          : [product.image_data || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80"];

        const currentIndex = imageIndices[pid] || 0;
        const currentImage = images[currentIndex];
        
        const displayVariant = product.displayVariant;
        const regularPrice = displayVariant?.regular_price || 0;
        const salePrice = displayVariant?.sale_price || regularPrice;
        const discount = Math.round((1 - salePrice / regularPrice) * 100);

        return (
          <div key={pid} className="group relative w-full h-full flex flex-col">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-3xl opacity-0 group-hover:from-[#f2c737]/40 group-hover:opacity-100 transition-all duration-700 blur-[2px] z-0" />

            <Link
              to={`/product/${pid}`}
              className="relative flex flex-col h-full bg-[#0d0d0d] rounded-3xl overflow-hidden border border-white/5 group-hover:border-[#f2c737]/30 transition-all duration-500 shadow-xl group-hover:shadow-[0_20px_50px_rgba(242,199,55,0.15)] group-hover:-translate-y-2 z-10"
            >
              {/* Product Badges & Wishlist */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-30">
                <div className="flex flex-col gap-2">
                  {discount > 0 && (
                    <span className="px-3 py-1.5 bg-red-500/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-black rounded-xl shadow-lg border border-red-400/30">
                      {discount}% OFF
                    </span>
                  )}
                  {index < 4 && (
                     <span className="px-3 py-1.5 bg-[#f2c737]/90 backdrop-blur-md text-black text-[10px] sm:text-xs font-black rounded-xl shadow-lg border border-[#f2c737]/30 w-max">
                        HOT
                     </span>
                  )}
                </div>
                <button
                  onClick={(e) => handleWishlistClick(e, product)}
                  className={`h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 shadow-lg ${
                    wishlisted 
                      ? "bg-[#e11d48]/20 border-[#e11d48]/50" 
                      : "bg-black/40 hover:bg-white/10"
                  }`}
                >
                  <Heart
                    size={18}
                    className={wishlisted ? "fill-[#e11d48] text-[#e11d48]" : "text-white/70 group-hover:text-white"}
                  />
                </button>
              </div>

              {/* Image Carousel */}
              <div className="relative h-[250px] sm:h-[280px] w-full bg-white overflow-hidden p-6 flex-shrink-0">
                {/* Inner shadow to blend the edge */}
                <div className="absolute inset-0 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.05)] pointer-events-none" />

                <img
                  src={currentImage}
                  alt={product.product_name}
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-transform duration-700 z-10 relative mix-blend-darken"
                  onError={(e) => {
                     // Prevent infinite loop if fallback also fails
                     if (e.target.src !== "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80") {
                      e.target.src = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80";
                     }
                  }}
                />

                {/* Carousel Controls */}
                {images.length > 1 && (
                  <>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 z-20">
                       <span className="text-white/90 text-[10px] font-bold tracking-widest">{currentIndex + 1} / {images.length}</span>
                    </div>

                    <button
                      onClick={(e) => handleImageChange(e, pid, "prev", images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black border border-white/10 z-20"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={(e) => handleImageChange(e, pid, "next", images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black border border-white/10 z-20"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-[#f2c737]/30 transition-colors duration-500" />

              {/* Product Details */}
              <div className="flex flex-col flex-grow p-5 bg-gradient-to-b from-black/20 to-transparent">
                <h3 className="text-lg font-bold text-white mb-auto line-clamp-2 leading-snug group-hover:text-[#f2c737] transition-colors duration-300">
                  {product.product_name}
                </h3>

                <div className="mt-4 flex items-end justify-between">
                  <div className="flex flex-col">
                    {discount > 0 && (
                      <span className="text-white/40 line-through text-xs font-medium mb-0.5">
                        ₹{regularPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 group-hover:from-[#f2c737] group-hover:to-yellow-300 transition-all duration-500">
                      ₹{salePrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
