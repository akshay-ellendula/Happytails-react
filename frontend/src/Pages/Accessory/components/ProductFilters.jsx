import React, { useState } from 'react';
import { Check } from 'lucide-react';
import styles from '../pet-accessory.module.css';

const FilterSection = ({ title, options = [], name, filterState, setFilterState }) => {
    const [isExpanded, setIsExpanded] = useState(false);

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
        <div className={`${styles.filters} ${!isExpanded ? styles.collapsed : ''}`}>
            <div className={styles.heading_button} onClick={() => setIsExpanded(!isExpanded)}>
                <h3 className={styles.h3}>{title}</h3> 
                <button 
                    type="button" 
                    className={styles['expand-button']} 
                >
                    {isExpanded ? '−' : '+'}
                </button>
            </div>
            <div className={styles['filter-options']} style={{ display: isExpanded ? 'block' : 'none' }}> 
                {(options || []).map(option => { 
                    const id = `${name}-${option.replace(/\s+/g, '-').toLowerCase()}`;
                    const isChecked = (filterState[name] || []).includes(option);
                    
                    return (
                        <p className={styles.p} key={id}> 
                            <input 
                                type="checkbox" 
                                id={id} 
                                name={name} 
                                value={option} 
                                className={styles['checkbox-input']}
                                checked={isChecked} 
                                onChange={handleCheckboxChange}
                            />
                            <label htmlFor={id}>
                                <span className={styles.checkbox_icon_container}>
                                    {isChecked && <Check size={14} strokeWidth={3} />}
                                </span>
                                {option}
                            </label> 
                        </p>
                    );
                })}
            </div>
        </div>
    );
};

const ProductFilters = ({ filters = {}, filterState, setFilterState, handleClearFilters, isMobileOpen, setIsMobileOpen }) => {
    
    const [isPriceExpanded, setIsPriceExpanded] = useState(false);

    const handlePriceChange = (e) => {
        const newPrice = parseFloat(e.target.value);
        setFilterState({ ...filterState, maxPrice: newPrice });
    };

    // This function is now only here to stop the page from reloading on 'Enter'
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
        <form 
            className={`${styles.filter_container} ${isMobileOpen ? styles.show : ''}`} 
            onSubmit={handleFilterSubmit}
        >
            <h2 className={styles.h2}>Filter by</h2> 

            <button 
                type="button" 
                className={styles['close-filters']} 
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close filters"
            >
                &times; 
            </button>
            
            <FilterSection 
                title="Product Type" 
                options={productTypes} 
                name="productTypes" 
                filterState={filterState} 
                setFilterState={setFilterState}
            />
            <hr className={styles.hr} /> 

            <FilterSection 
                title="Color" 
                options={colors} 
                name="colors" 
                filterState={filterState} 
                setFilterState={setFilterState} 
            />
            <hr className={styles.hr} />

            <FilterSection 
                title="Size" 
                options={sizes} 
                name="sizes" 
                filterState={filterState} 
                setFilterState={setFilterState} 
            />
            <hr className={styles.hr} />

            <div className={`${styles.filters} ${styles.price} ${!isPriceExpanded ? styles.collapsed : ''}`}>
                <div className={styles.heading_button} onClick={() => setIsPriceExpanded(!isPriceExpanded)}>
                    <h3 className={styles.h3}>Price</h3> 
                    <button type="button" className={styles['expand-button']}>
                         {isPriceExpanded ? '−' : '+'}
                    </button> 
                </div>
                <div className={styles.price_filter_div} style={{ display: isPriceExpanded ? 'block' : 'none' }}>
                    <label htmlFor="price"> 
                        Max Price: <span>₹{currentPrice.toFixed(2)}</span>
                    </label>
                    <input 
                        type="range" 
                        id="price" 
                        name="price" 
                        min="0" 
                        max={maxPrice} 
                        value={currentPrice}
                        onChange={handlePriceChange}
                        className={styles['range-input']}
                    />
                </div>
            </div>
            <hr className={styles.hr} />

            <button 
                type="button" 
                className={`${styles.button} ${styles['clear-filters']}`} 
                onClick={handleClearFilters}
            >
                Clear Filters
            </button> 
            
            {/* --- "APPLY FILTER" BUTTON REMOVED --- */}
            
        </form>
    );
};

export default ProductFilters;