// src/Pages/Accessory/ProductAccessoryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import styles from './pet-accessory.module.css';
import AccessoryNavbar from './components/AccessoryNavbar';
import ProductFilters from './components/ProductFilters';
import ProductGrid from './components/ProductGrid';
// import CartSidebar from './components/CartSidebar'; // REMOVED
import AccessoryFooter from './components/AccessoryFooter';
// import { axiosInstance } from '../../utils/axios'; // REMOVED
import { useCart } from '../../context/CartContext'; // ADDED

// --- REMOVED local useCart hook ---

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
    // const [isCartOpen, setIsCartOpen] = useState(false); // REMOVED

    // const { cart, updateQuantity, removeItem, calculateTotals, setCart } = useCart(); // REMOVED
    // const totals = calculateTotals(); // REMOVED
    
    const { openCart } = useCart(); // ADDED
    
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

    // --- REMOVED handleCheckout function ---

    return (
        <div style={{
            backgroundColor: "#effe8b", 
            minHeight: "100vh",
            margin: 0,
            padding: 0
        }}>
            {/* Navbars */}
            <AccessoryNavbar user={user} setIsCartOpen={openCart} /> {/* MODIFIED */}

            {/* --- REMOVED CartSidebar component --- */}

            <div className={styles.mobile_filter}>
                <h2 className={styles.filter_btn} onClick={() => setIsFilterPanelOpen(true)}>Filters</h2>
                <button className={styles['close-filters']}>✖ Close</button> 
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
        </div>
    );
};

export default ProductAccessoryPage;