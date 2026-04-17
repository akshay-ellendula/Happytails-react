import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import Footer from "../../components/Footer";
import Sidebar from "../ProfilePage/components/Sidebar";

const HeartIcon = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "#e11d48" : "none"}
    stroke={filled ? "#e11d48" : "currentColor"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "1.25rem", height: "1.25rem", transition: "all 0.2s ease" }}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function MyWishlistPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { wishlistItems, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  const getLowestPrice = (product) => {
    const variants = product.variants || [];
    if (!variants.length) return null;
    return variants.reduce((min, v) => {
      const price = v.sale_price || v.regular_price;
      return !min || price < (min.sale_price || min.regular_price) ? v : min;
    }, null);
  };

  const handleQuickAddToCart = (e, product) => {
    e.preventDefault();
    const variant = getLowestPrice(product);
    if (!variant) return;
    addToCart(product, variant, 1);
  };

  return (
    <div className="bg-[#f2c737] min-h-screen">
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      {isMobileMenuOpen && <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Sidebar activePage="wishlist" />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border-2 border-black">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "2.5rem",
                      height: "2.5rem",
                      background: "#fff0f3",
                      borderRadius: "50%",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="#e11d48"
                      style={{ width: "1.5rem", height: "1.5rem" }}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </span>
                  My Wishlist
                </h1>
                <p className="text-gray-500 mt-2">
                  {wishlistItems.length > 0
                    ? `${wishlistItems.length} item${wishlistItems.length > 1 ? "s" : ""} saved`
                    : "Your wishlist is empty"}
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div
                    className="animate-spin rounded-full border-4 border-gray-200"
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderTopColor: "#f2c737",
                    }}
                  />
                </div>
              ) : wishlistItems.length === 0 ? (
                /* ── Empty State ── */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div
                    style={{
                      width: "7rem",
                      height: "7rem",
                      background: "#fff0f3",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="1.5"
                      style={{ width: "3.5rem", height: "3.5rem" }}
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">No items yet</h2>
                  <p className="text-gray-500 mb-8 max-w-xs">
                    Start adding products you love by clicking the heart icon on any product.
                  </p>
                  <Link
                    to="/pet_accessory"
                    className="inline-flex items-center gap-2 bg-black text-[#f2c737] px-8 py-3 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors"
                  >
                    Browse Accessories
                  </Link>
                </div>
              ) : (
                /* ── Wishlist Grid ── */
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {wishlistItems.map((product) => {
                    const pid = product._id?.toString() || product.id?.toString();
                    const bestVariant = getLowestPrice(product);
                    return (
                      <div
                        key={pid}
                        style={{
                          background: "#fafafa",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: "1rem",
                          overflow: "hidden",
                          transition: "box-shadow 0.2s, transform 0.2s",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                          e.currentTarget.style.transform = "translateY(-3px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {/* Remove button */}
                        <button
                          onClick={() => toggleWishlist(product)}
                          title="Remove from wishlist"
                          style={{
                            position: "absolute",
                            top: "0.6rem",
                            right: "0.6rem",
                            zIndex: 10,
                            background: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "2rem",
                            height: "2rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                          }}
                        >
                          <HeartIcon filled />
                        </button>

                        {/* Product Image */}
                        <Link to={`/product/${pid}`}>
                          <div
                            style={{
                              width: "100%",
                              aspectRatio: "1/1",
                              overflow: "hidden",
                              background: "#f3f4f6",
                            }}
                          >
                            <img
                              src={product.image_data || "/images/default-product.jpg"}
                              alt={product.product_name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.3s ease",
                              }}
                              onMouseEnter={(e) => (e.target.style.transform = "scale(1.06)")}
                              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                            />
                          </div>
                        </Link>

                        {/* Product Info */}
                        <div style={{ padding: "0.85rem" }}>
                          <Link
                            to={`/product/${pid}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <p
                              style={{
                                fontWeight: 600,
                                fontSize: "0.95rem",
                                color: "#111827",
                                marginBottom: "0.3rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {product.product_name}
                            </p>
                          </Link>

                          {bestVariant && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                marginBottom: "0.75rem",
                              }}
                            >
                              {bestVariant.sale_price ? (
                                <>
                                  <span style={{ fontWeight: 700, color: "#111827" }}>
                                    ₹{bestVariant.sale_price.toFixed(2)}
                                  </span>
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      color: "#9ca3af",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    ₹{bestVariant.regular_price.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                <span style={{ fontWeight: 700, color: "#111827" }}>
                                  ₹{bestVariant.regular_price?.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}

                          <button
                            onClick={(e) => handleQuickAddToCart(e, product)}
                            style={{
                              width: "100%",
                              padding: "0.5rem",
                              background: "#111827",
                              color: "#f2c737",
                              border: "none",
                              borderRadius: "0.6rem",
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              cursor: "pointer",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => (e.target.style.background = "#374151")}
                            onMouseLeave={(e) => (e.target.style.background = "#111827")}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
