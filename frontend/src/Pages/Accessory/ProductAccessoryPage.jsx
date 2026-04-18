import React, { useState, useEffect, useCallback } from 'react';
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import ProductFilters from './components/ProductFilters';
import ProductGrid from './components/ProductGrid';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { Home, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Link } from 'react-router-dom';

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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const { openCart } = useCart();

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
        <div className="bg-[#050505] min-h-screen text-white flex flex-col font-outfit selection:bg-[#f2c737] selection:text-black">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] rounded-full bg-gradient-to-b from-[#f2c737]/5 to-transparent blur-[120px] -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-t from-[#f2c737]/5 to-transparent blur-[100px] translate-y-1/2" />
            </div>

            <div className="relative z-10">
                <Header onMenuToggle={toggleMobileMenu} />
                {isMobileMenuOpen && (
                    <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
                )}

                {/* Mobile Filter Toggle */}
                <div className="container mx-auto px-6 mt-8 lg:hidden">
                    <button
                        onClick={() => setIsFilterPanelOpen(true)}
                        className="w-full flex items-center justify-center gap-2 bg-[#f2c737] text-black font-bold py-3 px-6 rounded-xl shadow-lg active:scale-95 transition-transform"
                    >
                        <SlidersHorizontal size={18} />
                        Filters & Sort
                    </button>
                </div>

                {/* Main Shop Container */}
                <div className="container mx-auto px-6 lg:px-12 py-8 flex gap-8 lg:gap-12 pb-24">

                    {/* Filters Sidebar */}
                    <ProductFilters
                        filters={initialFilters}
                        filterState={filterState}
                        setFilterState={handleFilterChange}
                        handleClearFilters={handleClearFilters}
                        isMobileOpen={isFilterPanelOpen}
                        setIsMobileOpen={setIsFilterPanelOpen}
                    />

                    {/* Products Grid Area */}
                    <div className="flex-1 w-full min-w-0 flex flex-col">
                        <div className="flex items-end justify-between mb-2">
                            <h1 className="text-3xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
                                Boutique <span className="text-[#f2c737]">Collection</span>
                            </h1>
                        </div>

                        <ProductGrid products={visibleProducts} />
                    </div>
                </div>
            </div>

            <div className="relative z-10 border-t border-white/10 bg-[#0d0d0d]">
                <Footer />
            </div>
        </div>
    );
};

export default ProductAccessoryPage;