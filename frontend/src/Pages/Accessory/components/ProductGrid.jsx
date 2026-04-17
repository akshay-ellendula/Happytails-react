// src/pages/Accessory/components/ProductGrid.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../pet-accessory.module.css";
import { useWishlist } from "../../../context/WishlistContext";
import { useAuth } from "../../../hooks/useAuth";

const HeartIcon = ({ filled }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "#e11d48" : "none"}
    stroke={filled ? "#e11d48" : "white"}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "1.3rem", height: "1.3rem", transition: "all 0.2s ease", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ProductGrid = ({ products }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // State to track current image index for each product
  const [imageIndices, setImageIndices] = useState({});
  // State to track which product card has hover
  const [hoveredProductId, setHoveredProductId] = useState(null);

  const getImageIndex = (productId) => imageIndices[productId] || 0;

  const setImageIndex = (productId, index) => {
    setImageIndices(prev => ({
      ...prev,
      [productId]: index
    }));
  };

  const handleWishlistClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || user?.role !== "customer") {
      navigate("/login");
      return;
    }
    toggleWishlist(product);
  };

  const handleImageChange = (e, productId, direction) => {
    e.preventDefault();
    e.stopPropagation();
    
    const product = products.find(p => p.id?.toString() === productId?.toString() || p._id?.toString() === productId?.toString());
    if (!product) return;
    
    // Get all images for this product
    const images = product.images && product.images.length > 0
      ? product.images.map(img => img.image_data)
      : [product.image_data || "/images/default-product.jpg"];
    
    const currentIndex = getImageIndex(productId);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % images.length;
    } else {
      newIndex = (currentIndex - 1 + images.length) % images.length;
    }
    
    setImageIndex(productId, newIndex);
  };

  return (
    <div className={styles.product_container}>
      {products.length > 0 ? (
        products
          .filter((product) => product.isVisible)
          .map((product) => {
            const pid = product.id?.toString() || product._id?.toString();
            const wishlisted = isWishlisted(pid);
            
            // Get all images or fallback to single image
            const images = product.images && product.images.length > 0
              ? product.images.map(img => img.image_data)
              : [product.image_data || "/images/default-product.jpg"];
            
            const currentImageIndex = getImageIndex(pid);
            const currentImage = images[currentImageIndex];

            return (
              <Link
                to={`/product/${pid}`}
                key={pid}
                className={styles.product_card_link}
              >
                <div 
                  className={styles.product_card}
                  onMouseEnter={() => setHoveredProductId(pid)}
                  onMouseLeave={() => setHoveredProductId(null)}
                >
                  <div className={styles.product_card_img}>
                    <img
                      src={currentImage}
                      alt={product.product_name}
                      onError={(e) => { e.target.src = "/images/default-product.jpg"; }}
                    />
                    
                    {/* Show image counter and navigation only if multiple images exist */}
                    {images.length > 1 && (
                      <>
                        {/* Image counter badge */}
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          zIndex: 1
                        }}>
                          {currentImageIndex + 1}/{images.length}
                        </div>

                        {/* Navigation arrows - show on hover */}
                        {hoveredProductId === pid && (
                          <>
                            <button
                              onClick={(e) => handleImageChange(e, pid, 'prev')}
                              style={{
                                position: 'absolute',
                                left: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                zIndex: 2,
                                transition: 'background-color 0.2s'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
                            >
                              ❮
                            </button>
                            <button
                              onClick={(e) => handleImageChange(e, pid, 'next')}
                              style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                border: 'none',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                zIndex: 2,
                                transition: 'background-color 0.2s'
                              }}
                              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
                            >
                              ❯
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {/* Heart / Wishlist button */}
                    <button
                      className={styles.wishlist_btn}
                      onClick={(e) => handleWishlistClick(e, product)}
                      title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <HeartIcon filled={wishlisted} />
                    </button>
                  </div>
                  <div className={styles.product_card_details}>
                    <h3>{product.product_name}</h3>
                    {/* Display the correct price based on the pre-filtered variant */}
                    {product.displayVariant ? (
                      <p className={styles.p}>
                        {product.displayVariant.sale_price ? (
                          <>
                            ₹{product.displayVariant.sale_price.toFixed(2)}
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#888",
                                marginLeft: "0.4rem",
                              }}
                            >
                              ₹{product.displayVariant.regular_price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          `₹${product.displayVariant.regular_price.toFixed(2)}`
                        )}
                      </p>
                    ) : (
                      <p className={styles.p}>Price not available</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
      ) : (
        <p className={styles.no_products_message}>
          No products match your filters.
        </p>
      )}
    </div>
  );
};

export default ProductGrid;

