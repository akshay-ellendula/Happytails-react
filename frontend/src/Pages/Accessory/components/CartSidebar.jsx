// src/Pages/Accessory/components/CartSidebar.jsx

import React from 'react';
import styles from '../pet-accessory.module.css';
import { Trash2 } from 'lucide-react'; // <-- Import the Trash icon

const CartItem = ({ item, index, updateQuantity, removeItem }) => {
    // ... (imageSrc, price, quantity, itemTotal logic remains the same)
    const imageSrc = item.image_data
        ? item.image_data.startsWith('data:')
            ? item.image_data
            : 'data:image/jpeg;base64,' + item.image_data
        : '/images/default-product.jpg';

    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
    const itemTotal = (price * quantity).toFixed(2);


    return (
        <div className={styles.cart_product}>
            <div className={styles.cart_image}>
                <img src={imageSrc} alt={item.product_name} />
            </div>
            <div className={styles.cart_product_details}>
                <div className={styles.name_header}>
                    <h3 className={styles.h3}>{item.product_name}</h3>
                    {/* --- Replace img with Lucide icon --- */}
                    <Trash2
                        size={18} // Set size
                        // color="#effe8b" // Set color if needed (inherits text color by default)
                        strokeWidth={2} // Adjust stroke width if needed
                        onClick={() => removeItem(index)}
                        style={{ cursor: 'pointer', flexShrink: 0 }} // Prevent shrinking
                        aria-label="Remove item" // Accessibility
                    />
                    {/* --- End replacement --- */}
                </div>
                <p className={styles.p}>
                    Price: ₹<span className={styles['unit-price']}>{price.toFixed(2)}</span>
                </p>
                <p className={styles.p}>Size: {item.size || 'N/A'}</p>
                <p className={styles.p}>Color: {item.color || 'N/A'}</p>
                <div className={styles.quantity_section}>
                    <input
                        type="number"
                        className={styles.input}
                        min="1"
                        value={quantity}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value))} // Ensure integer
                    />
                    <p className={styles.p}>
                        ₹<span className={styles['total-price']}>{itemTotal}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- CartSidebar component remains largely the same ---
const CartSidebar = ({
    isOpen,
    setIsOpen,
    cart = [],
    totals = { subtotal: 0, charge: 0, total: 0 },
    updateQuantity,
    removeItem,
    handleCheckout,
}) => {
    return (
        <div id="cart" className={`${styles.cart} ${isOpen ? styles.open : ''}`}>
            <div className={styles.cart_wrapper}>
                <div className={styles.cart_header}>
                    <h2 className={styles.h2}>Cart</h2>
                    <button
                        className={styles['close-btn']}
                        onClick={() => setIsOpen(false)}
                        aria-label="Close cart"
                    >
                        &times;
                    </button>
                </div>

                <hr className={styles['hr-cart']} />

                <div className={styles['cart_product_container']} id="cart_product_container">
                    {cart.length === 0 ? (
                        <p className={`${styles.p} ${styles.cart_text}`}>Your cart is empty.</p>
                    ) : (
                        cart.map((item, index) => (
                            <CartItem
                                key={item.variant_id || `${item.product_id}-${index}`} // Use a more robust key
                                item={item}
                                index={index}
                                updateQuantity={updateQuantity}
                                removeItem={removeItem}
                            />
                        ))
                    )}
                </div>

                 {/* Subtotal section remains the same */}
                <div className={styles.subtotal}>
                   {/* ... hr, subtotal, charge, total details ... */}
                    <hr className={styles['hr-cart']} />
                    <div className={styles.subtotal_details}>
                        <h3 className={styles.h3}>Subtotal</h3>
                        <p className={styles.p}>₹{totals.subtotal.toFixed(2)}</p>
                    </div>
                    <div className={styles.charge_details}>
                        <p className={styles.p}>Charge (4%)</p>
                        <p className={styles.p}>₹{totals.charge.toFixed(2)}</p>
                    </div>
                    <hr className={styles['hr-cart']} />
                    <div className={styles.total_details}>
                        <h3 className={styles.h3}>Total</h3>
                        <p className={styles.p}>₹{totals.total.toFixed(2)}</p>
                    </div>
                    <div className={styles.checkout_button}>
                        <button className={styles.button} onClick={handleCheckout}>
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartSidebar;