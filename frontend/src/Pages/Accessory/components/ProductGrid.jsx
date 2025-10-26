// src/pages/Accessory/components/ProductGrid.jsx
import React from 'react';
import { Link } from 'react-router'; // 1. Import Link
import styles from '../pet-accessory.module.css';

const ProductGrid = ({ products }) => {
    return (
        <div className={styles.product_container}>
            {products.length > 0 ? (
                products
                    .filter(product => product.isVisible) // Filter based on parent's logic
                    .map(product => (
                        // 2. Wrap your card in a Link component
                        <Link 
                            to={`/product/${product.id}`} 
                            key={product.id} 
                            className={styles.product_card_link} // Add a class for styling
                        >
                            <div className={styles.product_card}>
                                <div className={styles.product_card_img}>
                                    <img 
                                        src={product.image_data || '/images/default-product.jpg'} 
                                        alt={product.product_name} 
                                    />
                                </div>
                                <div className={styles.product_card_details}>
                                    <h3>{product.product_name}</h3>
                                    {/* Display the correct price based on the pre-filtered variant */}
                                    {product.displayVariant ? (
                                        <p className={styles.p}>
                                            {product.displayVariant.sale_price ? (
                                                <>
                                                    ₹{product.displayVariant.sale_price.toFixed(2)}
                                                    <span style={{ textDecoration: 'line-through', color: '#888' }}>
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
                    ))
            ) : (
                <p className={styles.no_products_message}>No products match your filters.</p>
            )}
        </div>
    );
};

export default ProductGrid;