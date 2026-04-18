import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../../components/Footer";
import { axiosInstance } from "../../utils/axios";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import RatingStars from "../../components/RatingStars";
import {
  Facebook,
  Instagram,
  Twitter,
  ArrowLeft,
  ShoppingCart,
  Package,
  ThumbsUp,
  User,
  ChevronDown,
  ChevronUp,
  Star
} from "lucide-react";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState("default");
  const [selectedColor, setSelectedColor] = useState("default");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const [cartMessage, setCartMessage] = useState({ text: "", type: "error" });
  const [showCartMessage, setShowCartMessage] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Rating states
  const [ratings, setRatings] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsPage, setRatingsPage] = useState(1);
  const [hasMoreRatings, setHasMoreRatings] = useState(true);
  const [showAllRatings, setShowAllRatings] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const { openCart, addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const productId = product?.id?.toString() || product?._id?.toString();
  const wishlisted = isWishlisted(productId);

  const handleWishlistToggle = () => {
    if (!isAuthenticated || user?.role !== "customer") return;
    if (product) toggleWishlist(product);
  };

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get(`/products/getProduct/${id}`);

        if (response.data.success) {
          setProduct(response.data.product);
          const variants = response.data.product?.variants || [];
          const uniqueSizes = [
            ...new Set(variants.map((v) => v.size).filter((s) => s !== null)),
          ];
          const uniqueColors = [
            ...new Set(variants.map((v) => v.color).filter((c) => c !== null)),
          ];
          if (uniqueSizes.length === 1) {
            setSelectedSize(uniqueSizes[0]);
          }
          if (uniqueColors.length === 1 && uniqueSizes.length <= 1) {
            setSelectedColor(uniqueColors[0]);
          }
        } else {
          setError(response.data.message || "Product not found.");
        }
      } catch (err) {
        const message =
          err.response?.data?.message ||
          `Network error: ${err.message}. Could not fetch product details.`;
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch ratings when product loads
  useEffect(() => {
    if (product?.id) {
      fetchRatings();
      fetchRatingSummary();
    }
  }, [product?.id]);

  const fetchRatings = async (page = 1, append = false) => {
    if (!product?.id) return;

    setRatingsLoading(true);
    try {
      const response = await axiosInstance.get(`/ratings/product/${product.id}`, {
        params: { page, limit: 5 }
      });

      if (response.data.success) {
        if (append) {
          setRatings(prev => [...prev, ...response.data.ratings]);
        } else {
          setRatings(response.data.ratings);
        }
        setHasMoreRatings(response.data.ratings.length === 5);
        setRatingsPage(page);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setRatingsLoading(false);
    }
  };

  const fetchRatingSummary = async () => {
    if (!product?.id) return;

    try {
      const response = await axiosInstance.get(`/ratings/product/${product.id}/summary`);
      if (response.data.success) {
        setRatingSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error fetching rating summary:', error);
    }
  };

  const loadMoreRatings = () => {
    const nextPage = ratingsPage + 1;
    fetchRatings(nextPage, true);
  };

  const handleMarkHelpful = async (ratingId) => {
    try {
      const response = await axiosInstance.post(`/ratings/${ratingId}/helpful`);
      if (response.data.success) {
        setRatings(prev => prev.map(rating =>
          rating._id === ratingId
            ? { ...rating, helpful_count: response.data.helpful_count }
            : rating
        ));
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const availableSizes = useMemo(() => {
    if (!product) return [];
    return [
      ...new Set(product.variants.map((v) => v.size).filter((s) => s !== null)),
    ].sort();
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product) return [];
    const hasSizes = availableSizes.length > 0;
    if (!hasSizes) {
      return [
        ...new Set(
          product.variants.map((v) => v.color).filter((c) => c !== null)
        ),
      ].sort();
    }
    if (selectedSize !== "default") {
      return [
        ...new Set(
          product.variants
            .filter((v) => v.size === selectedSize && v.color !== null)
            .map((v) => v.color)
        ),
      ].sort();
    }
    return [];
  }, [product, selectedSize, availableSizes]);

  const currentVariant = useMemo(() => {
    if (!product) return null;
    const hasSizes = availableSizes.length > 0;
    const hasColors = product.variants.some((v) => v.color !== null);
    let variant = product.variants.find(
      (v) =>
        (!hasSizes || v.size === selectedSize) &&
        (!hasColors || v.color === selectedColor)
    );
    if (
      !variant &&
      hasSizes &&
      selectedSize !== "default" &&
      (!hasColors || selectedColor === "default")
    ) {
      const sizeVariants = product.variants.filter(
        (v) => v.size === selectedSize
      );
      variant =
        sizeVariants.find((v) => v.sale_price !== null) || sizeVariants[0];
    }
    if (!variant && !hasSizes && hasColors && selectedColor !== "default") {
      variant = product.variants.find((v) => v.color === selectedColor);
    }
    return variant || product.variants[0];
  }, [product, selectedSize, selectedColor, availableSizes]);

  const priceDisplay = useMemo(() => {
    if (!currentVariant) return <span className="text-white/50">Price unavailable</span>;

    if (currentVariant.sale_price !== null && currentVariant.sale_price < currentVariant.regular_price) {
      return (
        <div className="flex items-end gap-4">
          <span className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#f2c737]">
            ₹{currentVariant.sale_price.toFixed(2)}
          </span>
          <span className="text-2xl text-white/40 line-through mb-1">
            ₹{currentVariant.regular_price.toFixed(2)}
          </span>
          <span className="px-3 py-1 bg-red-500/90 text-white text-sm font-black rounded-lg shadow-lg border border-red-400/30 mb-2">
            SAVE {Math.round(((currentVariant.regular_price - currentVariant.sale_price) / currentVariant.regular_price) * 100)}%
          </span>
        </div>
      );
    }
    return currentVariant.regular_price !== null ? (
      <span className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#f2c737]">
        ₹{currentVariant.regular_price.toFixed(2)}
      </span>
    ) : (
      <span className="text-white/50">Price unavailable</span>
    );
  }, [currentVariant]);

  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
    setSelectedColor("default");
    setShowCartMessage(false);
  };

  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
    setShowCartMessage(false);
  };

  const displayMessage = (text, type = "error") => {
    setCartMessage({ text, type });
    setShowCartMessage(true);
    setTimeout(() => setShowCartMessage(false), 4000);
  };

  const handleAddToCart = () => {
    setShowCartMessage(false);
    const hasSizes = availableSizes.length > 0;
    const hasColors = product.variants.some((v) => v.color !== null);

    if (hasSizes && selectedSize === "default") {
      displayMessage("Please select a precise size fitting.");
      return;
    }
    if (hasColors && availableColors.length > 0 && selectedColor === "default") {
      displayMessage("Please precisely select a color finish.");
      return;
    }
    if (!currentVariant) {
      displayMessage("Could not determine the product variant. Please try again.");
      return;
    }

    const result = addToCart(product, currentVariant, quantity);

    if (result.success) {
      displayMessage(result.message, "success");
    } else {
      displayMessage(result.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-outfit">
        <div className="relative flex flex-col items-center">
          <div className="absolute inset-0 bg-[#f2c737]/20 blur-3xl rounded-full" />
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#f2c737] z-10 mb-4"></div>
          <p className="text-xl font-semibold text-white/70 z-10 tracking-widest uppercase">Fetching details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-5 font-outfit">
        <div className="bg-[#1a1a1a] border border-red-500/30 p-8 rounded-3xl shadow-2xl max-w-md text-center">
          <p className="text-red-400 font-bold text-xl">{error}</p>
          <Link to="/pet_accessory" className="mt-6 inline-block text-white/50 hover:text-[#f2c737] transition-colors">Return to Shop</Link>
        </div>
      </div>
    );
  }

  if (!product)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-outfit">
        <p className="text-2xl font-black text-white/50 tracking-widest uppercase">Product not found.</p>
      </div>
    );

  const showSizeSelector = availableSizes.length > 0;
  const showColorSelector = product.variants.some((v) => v.color !== null);
  const isColorDisabled = showSizeSelector && selectedSize === "default";

  return (
    <div className="bg-[#050505] min-h-screen text-white font-outfit selection:bg-[#f2c737] selection:text-black flex flex-col relative">

      {/* Ambient Lighting */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-b from-[#f2c737]/10 to-transparent blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-t from-orange-500/5 to-transparent blur-[100px] translate-y-1/2" />
      </div>

      <div className="relative z-10 flex-grow">
        <Header onMenuToggle={toggleMobileMenu} />
        {isMobileMenuOpen && (
          <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-4">
         
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

            {/* Image Gallery */}
            <div className="relative">
              <div className="lg:sticky lg:top-32">
                {(() => {
                  const imgs =
                    product.images && product.images.length > 0
                      ? product.images.map((img) => img.image_data)
                      : [product.image_data || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80"];
                  const activeSrc = imgs[selectedImageIdx] || imgs[0];
                  return (
                    <>
                      {/* Main image container */}
                      <div className="bg-white rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 mb-4 relative h-[350px] sm:h-[450px] lg:h-[500px]">
                        {/* Inner shadow to frame without padding */}
                        <div className="absolute inset-0 shadow-[inset_0_-10px_30px_rgba(0,0,0,0.05)] pointer-events-none z-0" />

                        <img
                          src={activeSrc}
                          alt={product.product_name}
                          className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] mix-blend-darken relative z-10 p-4 transition-transform duration-700 ease-out"
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80"; }}
                        />
                      </div>

                      {/* Thumbnail strip */}
                      {imgs.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                          {imgs.map((src, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImageIdx(idx)}
                              className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 relative bg-white ${selectedImageIdx === idx
                                ? "border-[#f2c737] shadow-[0_0_20px_rgba(242,199,55,0.3)] scale-105"
                                : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                                }`}
                            >
                              <img
                                src={src}
                                alt={`View ${idx + 1}`}
                                className="w-full h-full object-contain mix-blend-darken p-2"
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80"; }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-6 lg:pt-0">

              <div className="space-y-3">
                <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[#f2c737] uppercase tracking-widest text-xs font-bold">
                  Boutique Edition
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 leading-tight">
                  {product.product_name}
                </h1>

                {ratingSummary && ratingSummary.totalRatings > 0 && (
                  <div className="flex items-center gap-3 mt-4">
                    <RatingStars rating={ratingSummary.averageRating} readonly size="md" />
                    <span className="text-white/80 font-bold">
                      {ratingSummary.averageRating.toFixed(1)}
                    </span>
                    <span className="text-white/40">
                      {ratingSummary.totalRatings} Reviews
                    </span>
                  </div>
                )}
              </div>

              <div className="py-6 border-y border-white/10">
                {priceDisplay}
              </div>

              {/* Form Controls */}
              {(showSizeSelector || showColorSelector) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-3xl">
                  {showSizeSelector && (
                    <div className="space-y-3">
                      <label
                        htmlFor="size"
                        className="block text-xs font-bold text-white/50 uppercase tracking-widest"
                      >
                        Dimensions
                      </label>
                      <select
                        name="size"
                        id="size"
                        value={selectedSize}
                        onChange={handleSizeChange}
                        className="w-full px-5 py-4 border border-white/10 rounded-xl font-bold bg-[#1a1a1a] text-white focus:outline-none focus:border-[#f2c737] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="default" disabled={availableSizes.length === 1}>
                          Select Dimension
                        </option>
                        {availableSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {showColorSelector && (
                    <div className="space-y-3">
                      <label
                        htmlFor="color"
                        className="block text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2"
                      >
                        Finish
                        {isColorDisabled && (
                          <span className="text-red-400/80 normal-case italic">
                            (Requires dimension)
                          </span>
                        )}
                      </label>
                      <select
                        name="color"
                        id="color"
                        value={selectedColor}
                        onChange={handleColorChange}
                        disabled={isColorDisabled}
                        className={`w-full px-5 py-4 border border-white/10 rounded-xl font-bold bg-[#1a1a1a] text-white focus:outline-none focus:border-[#f2c737] transition-colors appearance-none cursor-pointer ${isColorDisabled ? 'opacity-50' : ''}`}
                      >
                        <option
                          value="default"
                          disabled={availableColors.length === 1 && !isColorDisabled}
                        >
                          {isColorDisabled ? "Awaiting Dimension..." : "Select Finish"}
                        </option>
                        {!isColorDisabled &&
                          availableColors.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Quantity & Stock Level */}
              <div className="space-y-4">
                <label
                  htmlFor="quantity"
                  className="block text-xs font-bold text-white/50 uppercase tracking-widest"
                >
                  Quantity
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={quantity}
                      min="1"
                      max={currentVariant?.stock_quantity ?? 1}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-28 px-4 py-4 border border-white/10 bg-[#1a1a1a] rounded-xl font-bold text-center text-white focus:outline-none focus:border-[#f2c737] transition-colors"
                      aria-label="Quantity"
                    />
                  </div>

                  {currentVariant && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/5">
                      <Package className={`w-5 h-5 ${currentVariant.stock_quantity > 0 ? 'text-[#f2c737]' : 'text-red-500'}`} />
                      <span
                        className={`font-bold tracking-wide uppercase text-sm ${currentVariant.stock_quantity > 10
                          ? "text-emerald-400"
                          : currentVariant.stock_quantity > 0
                            ? "text-[#f2c737]"
                            : "text-red-500"
                          }`}
                      >
                        {currentVariant.stock_quantity > 0
                          ? `${currentVariant.stock_quantity} verified in stock`
                          : "Temporarily Unvailable"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  id="addToCartBtn"
                  onClick={handleAddToCart}
                  disabled={!currentVariant || currentVariant.stock_quantity < 1}
                  className="group relative flex-1 h-16 bg-[#f2c737] text-black font-black text-xl rounded-2xl hover:scale-[1.02] transition-all duration-300 disabled:bg-gray-800 disabled:text-gray-500 disabled:scale-100 shadow-[0_10px_40px_rgba(242,199,55,0.2)] hover:shadow-[0_15px_50px_rgba(242,199,55,0.4)] disabled:shadow-none overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <ShoppingCart strokeWidth={2.5} className="w-6 h-6" />
                    {currentVariant?.stock_quantity > 0
                      ? "Acquire Now"
                      : "Out of Stock"}
                  </span>
                </button>

                {/* Wishlist toggle button */}
                {isAuthenticated && user?.role === "customer" && (
                  <button
                    id="wishlistBtn"
                    onClick={handleWishlistToggle}
                    title={wishlisted ? "Remove from Vault" : "Add to Vault"}
                    className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-300 ${wishlisted
                      ? "bg-[#e11d48]/20 border-[#e11d48] shadow-[0_0_20px_rgba(225,29,72,0.3)]"
                      : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10"
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={wishlisted ? "#e11d48" : "none"}
                      stroke={wishlisted ? "#e11d48" : "#9ca3af"}
                      strokeWidth="2.5"
                      style={{ width: "1.6rem", height: "1.6rem", transition: "all 0.25s ease" }}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                )}
              </div>

              {showCartMessage && (
                <div
                  className={`p-4 rounded-xl font-bold backdrop-blur-md animate-fade-in-up ${cartMessage.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}
                  role="alert"
                >
                  {cartMessage.text}
                </div>
              )}

              {product.product_description && (
                <div className="pt-6">
                  <h4 className="text-lg font-black text-white mb-3 uppercase tracking-widest">
                    The Blueprint
                  </h4>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-5 rounded-2xl">
                    <p className="text-white/60 leading-relax font-medium text-base lg:text-lg">
                      {product.product_description}
                    </p>
                  </div>
                </div>
              )}

              {/* Ratings Section */}
              {ratingSummary && ratingSummary.totalRatings > 0 && (
                <div className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-black text-white uppercase tracking-widest">
                      Patron Insights
                    </h4>
                    <button
                      onClick={() => setShowAllRatings(!showAllRatings)}
                      className="text-sm font-bold text-[#f2c737] hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f2c737]/10 hover:bg-[#f2c737]/20 transition-colors"
                    >
                      {showAllRatings ? (
                        <>Collapse <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>Expand <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>

                  {/* Rating Summary Block */}
                  <div className="flex flex-col md:flex-row items-center gap-8 mb-8 p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm shadow-xl">
                    <div className="text-center md:border-r border-white/10 md:pr-8">
                      <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-[#f2c737] mb-2">
                        {ratingSummary.averageRating}
                      </div>
                      <RatingStars rating={ratingSummary.averageRating} readonly size="md" />
                      <div className="text-sm font-bold tracking-widest uppercase text-white/40 mt-3">
                        {ratingSummary.totalRatings} Total
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = ratingSummary.distribution[star] || 0;
                        const percentage = ratingSummary.totalRatings > 0
                          ? (count / ratingSummary.totalRatings) * 100
                          : 0;
                        return (
                          <div key={star} className="flex items-center gap-4">
                            <div className="w-12 text-sm font-bold text-white/70 flex items-center gap-1">{star} <Star size={12} className="fill-[#f2c737] text-[#f2c737]" /></div>
                            <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-gradient-to-r from-[#f2c737] to-amber-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="w-8 text-sm font-bold text-white/40 text-right">{count}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Ratings Container */}
                  {(showAllRatings || ratings.length > 0) && showAllRatings && (
                    <div className="space-y-6">
                      {ratings.length === 0 && !ratingsLoading && (
                        <p className="text-white/40 text-center py-8 font-bold italic">
                          Awaiting the first critique.
                        </p>
                      )}

                      {ratings.map((rating) => (
                        <div key={rating._id} className="p-6 rounded-2xl bg-[#111] border border-white/5 transition-colors hover:border-white/10">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-white/40" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-white tracking-wide">
                                    {rating.customer_id?.userName || 'Anonymous Client'}
                                  </span>
                                  {rating.isVerifiedPurchase && (
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 mt-0.5">
                                      Verified Patron
                                    </span>
                                  )}
                                </div>
                              </div>
                              <RatingStars rating={rating.rating} readonly size="sm" />
                            </div>
                            <div className="text-xs font-bold tracking-widest text-white/30 uppercase">
                              {new Date(rating.created_at).toLocaleDateString()}
                            </div>
                          </div>

                          {rating.title && (
                            <h5 className="font-black text-xl text-white mt-4 tracking-wide">
                              "{rating.title}"
                            </h5>
                          )}

                          {rating.review && (
                            <p className="text-white/60 mt-2 leading-relaxed text-lg">
                              {rating.review}
                            </p>
                          )}

                          <button
                            onClick={() => handleMarkHelpful(rating._id)}
                            className="flex items-center gap-2 text-sm font-bold text-white/40 hover:text-[#f2c737] mt-5 transition-colors bg-white/5 px-4 py-2 rounded-lg"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>Helpful ({rating.helpful_count})</span>
                          </button>
                        </div>
                      ))}

                      {hasMoreRatings && (
                        <button
                          onClick={loadMoreRatings}
                          disabled={ratingsLoading}
                          className="w-full py-4 text-center text-white/50 border border-white/10 bg-white/5 font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 hover:text-white transition-all mt-4"
                        >
                          {ratingsLoading ? 'Fetching Details...' : 'Load Extended Critique'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Show preview when collapsed */}
                  {!showAllRatings && ratings.length > 0 && (
                    <div className="space-y-4">
                      {ratings.slice(0, 2).map((rating) => (
                        <div key={rating._id} className="p-5 rounded-2xl bg-[#111] border border-white/5 transition-colors hover:border-white/10">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white/40" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white text-sm">
                                {rating.customer_id?.userName || 'Anonymous Client'}
                              </span>
                              <div className="flex items-center gap-2">
                                <RatingStars rating={rating.rating} readonly size="sm" />
                              </div>
                            </div>
                          </div>
                          {rating.title && (
                            <p className="font-black text-white italic mt-3 text-lg leading-snug">
                              "{rating.title}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-10">
                <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">
                  Broadcast to Network
                </h4>
                <div className="flex gap-4">
                  <a
                    href="#"
                    aria-label="Share on Facebook"
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    aria-label="Share on Instagram"
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent transition-all"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    aria-label="Share on Twitter"
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10">
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetailPage;