import React, { useState, useEffect, useCallback } from 'react';
import styles from './pet-accessory.module.css';
// UPDATED: Import Header and MobileMenu
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import ProductFilters from './components/ProductFilters';
import ProductGrid from './components/ProductGrid';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

const ProductAccessoryPage = ({ user, productsData, filters: initialFilters }) => {
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
    
    // UPDATED: Add mobile menu state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const { openCart } = useCart(); // This is now used by the Header
    
    const applyFilters = useCallback(() => {
        const { productTypes, colors, sizes, maxPrice } = filterState;
        let count = 0;

        const newVisibleProducts = allProducts.map(product => {
            const matchesType = productTypes.length === 0 || 
                productTypes.some(type => product.product_type.toLowerCase().includes(type.toLowerCase()));

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

            const price = variantToDisplay.sale_price || variantToDisplay.regular_price;
            const matchesPrice = price <= maxPrice;

            const isVisible = matchesType && matchesPrice && (variantSource.length > 0);
            
            if (isVisible) count++;

            return { 
                ...product, 
                isVisible, 
                displayVariant: variantToDisplay
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

    return (
        <div style={{
            backgroundColor: "#effe8b", 
            minHeight: "100vh",
            margin: 0,
            padding: 0
        }}>
            {/* UPDATED: Use Header and MobileMenu */}
            <Header onMenuToggle={toggleMobileMenu} />
            {isMobileMenuOpen && (
                <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
            )}

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
            <Footer />
        </div>
    );
};

export default ProductAccessoryPage;