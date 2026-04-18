import React, { useState } from 'react';
import { Check, ChevronDown, FilterX } from 'lucide-react';

const FilterSection = ({ title, options = [], name, filterState, setFilterState }) => {
    const [isExpanded, setIsExpanded] = useState(true); // Default open for better UX

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        const current = filterState[name] || []; 
        let newState;
        
        if (checked) {
            newState = [...current, value];
        } else {
            newState = current.filter(item => item !== value);
        }
        setFilterState({ ...filterState, [name]: newState });
    };

    return (
        <div className="border-b border-white/5 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
            <button 
                type="button"
                className="w-full flex items-center justify-between py-2 group text-left" 
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h3 className="text-white font-bold tracking-wide uppercase text-sm group-hover:text-[#f2c737] transition-colors">{title}</h3> 
                <ChevronDown 
                    size={16} 
                    className={`text-white/40 group-hover:text-[#f2c737] transition-all duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
                />
            </button>
            <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
            > 
                <div className="flex flex-col gap-2.5">
                    {(options || []).map(option => { 
                        const id = `${name}-${option.replace(/\s+/g, '-').toLowerCase()}`;
                        const isChecked = (filterState[name] || []).includes(option);
                        
                        return (
                            <label 
                                key={id} 
                                htmlFor={id}
                                className="group flex items-center gap-3 cursor-pointer select-none"
                            >
                                <div className="relative flex items-center justify-center w-5 h-5 rounded-md border border-white/20 bg-black/50 group-hover:border-[#f2c737]/50 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        id={id} 
                                        name={name} 
                                        value={option} 
                                        className="peer sr-only"
                                        checked={isChecked} 
                                        onChange={handleCheckboxChange}
                                    />
                                    {/* Custom Checkbox Fill */}
                                    <div className="absolute inset-0 rounded-md bg-[#f2c737] scale-0 peer-checked:scale-100 transition-transform duration-200 ease-out" />
                                    {/* Tick mark */}
                                    <Check size={14} strokeWidth={3} className="text-black relative z-10 scale-0 peer-checked:scale-100 transition-transform duration-200 delay-100" />
                                </div>
                                <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                                    {option}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ProductFilters = ({ filters = {}, filterState, setFilterState, handleClearFilters, isMobileOpen, setIsMobileOpen }) => {
    const [isPriceExpanded, setIsPriceExpanded] = useState(true);

    const handlePriceChange = (e) => {
        const newPrice = parseFloat(e.target.value);
        setFilterState({ ...filterState, maxPrice: newPrice });
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setIsMobileOpen(false); 
    };
    
    const productTypes = filters.productTypes || [];
    const colors = filters.colors || [];
    const sizes = filters.sizes || [];
    const maxPrice = typeof filters.maxPrice === 'number' ? filters.maxPrice : 15000;
    const currentPrice = filterState.maxPrice ?? maxPrice;

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Form */}
            <form 
                className={`fixed lg:sticky top-0 lg:top-24 h-screen lg:h-[calc(100vh-7rem)] w-72 max-w-[80vw] bg-[#0d0d0d]/95 lg:bg-[#0d0d0d]/80 backdrop-blur-2xl border-r lg:border border-white/5 lg:rounded-3xl p-6 flex flex-col z-50 lg:z-[5] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isMobileOpen ? 'translate-x-0 left-0' : '-translate-x-full lg:translate-x-0 lg:left-auto'
                } overflow-y-auto no-scrollbar shadow-[20px_0_50px_rgba(0,0,0,0.5)] lg:shadow-[0_10px_40px_rgba(0,0,0,0.3)]`}
                style={{
                     /* Hide scrollbar for clean aesthetic */
                     scrollbarWidth: 'none',
                     msOverflowStyle: 'none'
                }}
                onSubmit={handleFilterSubmit}
            >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Filters</h2> 
                    <button 
                        type="button" 
                        className="lg:hidden text-white/50 hover:text-white transition-colors"
                        onClick={() => setIsMobileOpen(false)}
                        aria-label="Close filters"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="flex-grow flex flex-col">
                    <FilterSection 
                        title="Product Type" 
                        options={productTypes} 
                        name="productTypes" 
                        filterState={filterState} 
                        setFilterState={setFilterState}
                    />

                    <FilterSection 
                        title="Color" 
                        options={colors} 
                        name="colors" 
                        filterState={filterState} 
                        setFilterState={setFilterState} 
                    />

                    <FilterSection 
                        title="Size" 
                        options={sizes} 
                        name="sizes" 
                        filterState={filterState} 
                        setFilterState={setFilterState} 
                    />

                    <div className="border-b border-white/5 pb-4 mb-4">
                        <button 
                            type="button"
                            className="w-full flex items-center justify-between py-2 group text-left" 
                            onClick={() => setIsPriceExpanded(!isPriceExpanded)}
                        >
                            <h3 className="text-white font-bold tracking-wide uppercase text-sm group-hover:text-[#f2c737] transition-colors">Price Range</h3> 
                            <ChevronDown 
                                size={16} 
                                className={`text-white/40 group-hover:text-[#f2c737] transition-all duration-300 ${isPriceExpanded ? 'rotate-180' : 'rotate-0'}`} 
                            />
                        </button>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isPriceExpanded ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">Max Price:</span>
                                    <span className="font-bold text-[#f2c737]">₹{currentPrice.toFixed(0)}</span>
                                </div>
                                <div className="relative w-full h-2 bg-white/10 rounded-full">
                                    <div 
                                        className="absolute left-0 top-0 h-full bg-[#f2c737] rounded-full" 
                                        style={{ width: `${(currentPrice / maxPrice) * 100}%` }}
                                    />
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={maxPrice} 
                                        value={currentPrice}
                                        onChange={handlePriceChange}
                                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-white/40 font-medium">
                                    <span>₹0</span>
                                    <span>₹{maxPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <button 
                        type="button" 
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white/5 hover:bg-white/10 text-white hover:text-red-400 font-bold tracking-wide rounded-xl border border-white/10 hover:border-red-400/30 transition-all duration-300" 
                        onClick={handleClearFilters}
                    >
                        <FilterX size={18} />
                        Clear All Filters
                    </button> 
                </div>
            </form>
        </>
    );
};

export default ProductFilters;