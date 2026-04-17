// src/pages/Accessory/components/ProductGrid.jsx
import React from "react";
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

  const handleWishlistClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || user?.role !== "customer") {
      navigate("/login");
      return;
    }
    toggleWishlist(product);
  };

  return (
    <div className={styles.product_container}>
      {products.length > 0 ? (
        products
          .filter((product) => product.isVisible)
          .map((product) => {
            const pid = product.id?.toString() || product._id?.toString();
            const wishlisted = isWishlisted(pid);
            return (
              <Link
                to={`/product/${pid}`}
                key={pid}
                className={styles.product_card_link}
              >
                <div className={styles.product_card}>
                  <div className={styles.product_card_img} style={{ position: "relative" }}>
                    <img
                      src={product.image_data || "/images/default-product.jpg"}
                      alt={product.product_name}
                    />
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

