// frontend/src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../utils/axios';
import { toast } from 'react-hot-toast';

// 1. Create the context
const CartContext = createContext();

// 2. Create a hook to easily use the context
export const useCart = () => useContext(CartContext);

// 3. Create the Provider component
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

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // --- Cart State Functions ---
    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    // --- Cart Item Functions ---
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

    // --- Core Logic Functions ---
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
        openCart(); // Open the cart on successful add
        return { success: true, message: 'Added to cart!' };
    };
    
    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error('Your cart is empty!');
            return;
        }

        const cartWithoutImages = cart.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_name: item.product_name,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0,
            size: item.size || null,
            color: item.color || null
        }));

        try {
            const response = await axiosInstance.post('/products/checkout', { cart: cartWithoutImages });
            const result = response.data;

            if (!result.success) {
                toast.error(result.message || 'Checkout failed.');
                if (response.status === 400 && result.message.includes('profile')) {
                    window.location.href = '/profile';
                }
                return;
            }

            if (result.success && result.redirectUrl) {
                setCart([]); // Clear cart
                window.location.href = result.redirectUrl;
            }

        } catch (error) {
            const message = error.response?.data?.message || `Network error: ${error.message}.`;
            toast.error(message);
        }
    };

    // 4. Provide all values
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