import React, { useState, useEffect, useCallback } from 'react';
import styles from './pet-accessory.module.css';
// Assuming these helper components are defined below or in separate files
import AccessoryNavbar from './components/AccessoryNavbar';
import ProductFilters from './components/ProductFilters';
import ProductGrid from './components/ProductGrid';
import CartSidebar from './components/CartSidebar';
import AccessoryFooter from './components/AccessoryFooter';
import { axiosInstance } from '../../utils/axios';

// --- Utility Functions (Simulating client-side logic) ---

// Custom hook for cart management
const useCart = () => {
    const [cart, setCart] = useState(() => {
        try {
            const localCart = localStorage.getItem('cart');
            return localCart ? JSON.parse(localCart) : [];
        } catch (error) {
            console.error("Error reading cart from localStorage:", error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

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

    return { cart, updateQuantity, removeItem, calculateTotals, setCart };
};

// --- Main Page Component ---

const ProductAccessoryPage = ({ user, productsData, filters: initialFilters }) => {
    // Note: In a real React app, productsData and initialFilters would be fetched via useEffect/API call.
    // We assume they are passed as props from the server-side render or initial load.
    const allProducts = productsData;
    const initialPrice = parseFloat(initialFilters.maxPrice);

    const [filterState, setFilterState] = useState({
        productTypes: [],
        colors: [],
        sizes: [],
        maxPrice: initialPrice,
    });
    const [visibleProducts, setVisibleProducts] = useState(allProducts);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { cart, updateQuantity, removeItem, calculateTotals, setCart } = useCart();
    const totals = calculateTotals();
    
    // Logic to apply filters
    const applyFilters = useCallback(() => {
        const { productTypes, colors, sizes, maxPrice } = filterState;
        let count = 0;

        const newVisibleProducts = allProducts.map(product => {
            // 1. Filter by product type
            const matchesType = productTypes.length === 0 || 
                productTypes.some(type => product.product_type.toLowerCase().includes(type.toLowerCase()));

            // 2. Filter by color/size variants
            let matchingVariants = product.variants || [];
            
            if (colors.length > 0) {
                matchingVariants = matchingVariants.filter(v => 
                    v.color && colors.some(c => v.color.toLowerCase().includes(c.toLowerCase()))
                );
            }

            if (sizes.length > 0) {
                matchingVariants = matchingVariants.filter(v => 
                    v.size && sizes.some(s => v.size.toLowerCase().includes(s.toLowerCase()))
                );
            }

            // Determine the variant to display for price check
            const variantSource = (matchingVariants.length > 0 || (colors.length === 0 && sizes.length === 0))
                ? matchingVariants.length > 0 ? matchingVariants : product.variants
                : [];
            
            const variantToDisplay = variantSource.reduce((min, variant) => {
                const price = variant.sale_price || variant.regular_price;
                return (!min || price < (min.sale_price || min.regular_price)) ? variant : min;
            }, null);

            if (!variantToDisplay) {
                return { ...product, isVisible: false, displayVariant: null };
            }

            // 3. Filter by price
            const price = variantToDisplay.sale_price || variantToDisplay.regular_price;
            const matchesPrice = price <= maxPrice;

            const isVisible = matchesType && matchesPrice && (variantSource.length > 0);
            
            if (isVisible) count++;

            return { 
                ...product, 
                isVisible, 
                displayVariant: variantToDisplay // Pass variant for correct price display
            };
        });

        setVisibleProducts(newVisibleProducts);
    }, [filterState, allProducts]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);


    const handleFilterChange = (newFilters) => {
        setFilterState(prev => ({ ...prev, ...newFilters }));
    };

    const handleClearFilters = () => {
        setFilterState({
            productTypes: [],
            colors: [],
            sizes: [],
            maxPrice: initialPrice,
        });
    };

    // Placeholder for actual checkout call (EJS logic)
    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Prepare cart data for server (unchanged)
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
            // Use axiosInstance instead of fetch
            const response = await axiosInstance.post('/products/checkout', { cart: cartWithoutImages });

            const result = response.data; // Axios uses .data for the parsed JSON

            if (!response.status === 200 || !result.success) { // Check success
                alert(result.message || 'Checkout failed. Please try again.');
                if (response.status === 400 && result.message.includes('profile')) {
                    window.location.href = '/profile';
                }
                return;
            }

            if (result.success && result.redirectUrl) {
                setCart([]); // Clear cart state
                window.location.href = result.redirectUrl;
            } else {
                alert('Unexpected response from server');
            }

        } catch (error) {
            console.error('Checkout error:', error);
            // More specific error handling (Axios provides better details)
            const message = error.response?.data?.message || `Network error: ${error.message}. Please check your connection.`;
            alert(message);
        }
    };

    return (
        <>
            {/* Navbars */}
            <AccessoryNavbar user={user} setIsCartOpen={setIsCartOpen} />

            {/* Cart Sidebar */}
            <CartSidebar 
                isOpen={isCartOpen}
                setIsOpen={setIsCartOpen}
                cart={cart}
                totals={totals}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                handleCheckout={handleCheckout}
            />

            <div className={styles.mobile_filter}>
                <h2 className={styles.filter_btn} onClick={() => setIsFilterPanelOpen(true)}>Filters</h2>
                <button className={styles['close-filters']}>✖ Close</button> {/* This button is only for mobile CSS hiding on non-JS devices, the click handler is below */}
            </div>

            <div className={styles.breadcrumb}>
                <a href= "/">Home</a>
                <span> {'>'} </span>
                <a href="/pet_accessory">Accessories</a>
            </div>

            <div className={styles.main_container}>
                {/* Filters */}
                <ProductFilters
                    filters={initialFilters}
                    filterState={filterState}
                    setFilterState={handleFilterChange}
                    handleClearFilters={handleClearFilters}
                    isMobileOpen={isFilterPanelOpen}
                    setIsMobileOpen={setIsFilterPanelOpen}
                />

                {/* Product Grid */}
                <ProductGrid products={visibleProducts} />
            </div>

            {/* Footer */}
            <AccessoryFooter />
        </>
    );
};

export default ProductAccessoryPage;