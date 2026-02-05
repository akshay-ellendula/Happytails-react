import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../utils/axios';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const localCart = localStorage.getItem('cart');
            return localCart ? JSON.parse(localCart) : [];
        } catch (error) {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const updateQuantity = useCallback((index, quantity) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            newCart[index].quantity = parseInt(quantity) || 1;
            return newCart;
        });
    }, []);

    const removeItem = useCallback((index) => {
        setCart(prevCart => prevCart.filter((_, i) => i !== index));
    }, []);

    const calculateTotals = useCallback(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const charge = subtotal * 0.04;
        const total = subtotal + charge;
        return { subtotal, charge, total };
    }, [cart]);

    const addToCart = (product, variant, quantity) => {
        if (!product || !variant) {
            return { success: false, message: 'Invalid product data.' };
        }
        
        if (variant.stock_quantity < quantity) {
             return { success: false, message: `Only ${variant.stock_quantity} left in stock.` };
        }
        
        const cartItem = {
            product_id: product.id,
            variant_id: variant.variant_id,
            product_name: product.product_name,
            price: variant.sale_price ?? variant.regular_price,
            size: variant.size,
            color: variant.color,
            quantity: parseInt(quantity),
            image_data: product.image_data 
        };

        let newCart = [...cart];
        const existingItemIndex = newCart.findIndex(item =>
            item.product_id === cartItem.product_id &&
            item.variant_id === cartItem.variant_id
        );

        if (existingItemIndex > -1) {
            const newQuantity = newCart[existingItemIndex].quantity + cartItem.quantity;
            if (variant.stock_quantity < newQuantity) {
                 return { success: false, message: `Only ${variant.stock_quantity - newCart[existingItemIndex].quantity} more items available.` };
            }
            newCart[existingItemIndex].quantity = newQuantity;
        } else {
            newCart.push(cartItem);
        }

        setCart(newCart);
        openCart();
        return { success: true, message: 'Added to cart!' };
    };
    
    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('Your cart is empty!');
            return;
        }
        window.location.href = '/checkout';  // ← changed to redirect
    };

    const value = {
        cart,
        isCartOpen,
        openCart,
        closeCart,
        updateQuantity,
        removeItem,
        calculateTotals,
        addToCart,
        handleCheckout,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};