import React from 'react';
import styles from '../pet-accessory.module.css';

const ProductGrid = ({ products = [] }) => { // Default products to empty array
    // Ensure products is an array and filter safely
    const visibleProducts = Array.isArray(products) ? products.filter(p => p && p.isVisible) : [];
    const hasProducts = visibleProducts.length > 0;

    const handleCardClick = (productId) => {
        // Only navigate if productId is valid
        if(productId) {
            window.location.href = `/product/${productId}`; // Consider using React Router's useNavigate hook
        }
    };

    return (
        <div className={styles.product_container}>
            {visibleProducts.map(product => {
                 // Destructure safely, provide defaults
                 const { id, product_name = 'Unnamed Product', image_data, displayVariant } = product || {};
                 
                 // Check if displayVariant exists and has prices
                 const regularPrice = (displayVariant?.regular_price ?? 0).toFixed(2);
                 const salePrice = displayVariant?.sale_price ? displayVariant.sale_price.toFixed(2) : null;
                 
                // ... imageSrc logic ...
                const imageSrc = image_data
                    ? image_data.startsWith('data:') 
                        ? image_data 
                        : 'data:image/jpeg;base64,' + image_data 
                    : '/images/default-product.jpg'; // Ensure path is correct


                return (
                    <div 
                        key={id || Math.random()} // Use a fallback key if id is missing
                        className={`${styles.product_card} ${styles.autoshow}`} 
                        data-product-id={id}
                        onClick={() => handleCardClick(id)}
                    >
                        <div className={styles.product_card_img}>
                            <img src={imageSrc} alt={product_name} />
                        </div>
                        <div className={styles.product_card_details}>
                             {/* Use h3 class */}
                            <h3 className={styles.h3}>{product_name}</h3> 
                             {/* Use p class */}
                            <p className={`${styles.p} price-display`}> {/* Keep price-display if needed for JS */}
                                {salePrice ? (
                                    <>
                                        ₹{salePrice} <span>₹{regularPrice}</span> {/* Span styled via descendant selector */}
                                    </>
                                ) : (
                                    `₹${regularPrice}`
                                )}
                            </p>
                        </div>
                    </div>
                );
            })}
            
            {!hasProducts && (
                 // Use p class
                <p className={`${styles.p} ${styles['no-products-message']}`}> 
                    No products match your filters.
                </p>
            )}
        </div>
    );
};

export default ProductGrid;