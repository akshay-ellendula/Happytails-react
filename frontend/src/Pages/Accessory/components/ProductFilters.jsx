import React, { useState } from 'react';
import styles from '../pet-accessory.module.css';

const FilterSection = ({ title, options = [], name, filterState, setFilterState }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        // Ensure setFilterState is treated as a function receiving the previous state
        setFilterState(prev => {
            const current = prev[name] || []; // Default to empty array if undefined
            let newState;
            if (checked) {
                newState = [...current, value];
            } else {
                newState = current.filter(item => item !== value);
            }
             return { ...prev, [name]: newState }; // Return the updated state object
        });
    };

    return (
        // Add collapsed class dynamically
        <div className={`${styles.filters} ${!isExpanded ? styles.collapsed : ''}`}>
             {/* Make heading clickable */}
            <div className={styles.heading_button} onClick={() => setIsExpanded(!isExpanded)}>
                 {/* Use h3 */}
                <h3>{title}</h3> 
                {/* Use button class */}
                <button 
                    type="button" 
                    className={styles['expand-button']} 
                >
                    {isExpanded ? '−' : '+'}
                </button>
            </div>
             {/* Add filter-options class */}
            <div className={styles['filter-options']} style={{ display: isExpanded ? 'block' : 'none' }}> 
                {(options || []).map(option => { // Add safety check for options array
                    const id = `${name}-${option.replace(/\s+/g, '-').toLowerCase()}`;
                    return (
                         // Use p
                        <p className={styles.p} key={id}> 
                             {/* Use checkbox-input class */}
                            <input 
                                type="checkbox" 
                                id={id} 
                                name={name} 
                                value={option} 
                                className={styles['checkbox-input']}
                                // Ensure filterState[name] exists before calling includes
                                checked={(filterState[name] || []).includes(option)} 
                                onChange={handleCheckboxChange}
                            />
                             {/* Label tag is styled via adjacent selector in CSS */}
                            <label htmlFor={id}>{option}</label> 
                        </p>
                    );
                })}
            </div>
        </div>
    );
};

const ProductFilters = ({ filters = {}, filterState, setFilterState, handleClearFilters, isMobileOpen, setIsMobileOpen }) => {
    
    // Price filter handler - Ensure it updates the state object correctly
    const handlePriceChange = (e) => {
         setFilterState(prev => ({ ...prev, maxPrice: parseFloat(e.target.value) }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setIsMobileOpen(false); // Close mobile panel
    };
    
    // Provide defaults for filter options directly
    const productTypes = filters.productTypes || [];
    const colors = filters.colors || [];
    const sizes = filters.sizes || [];
    const maxPrice = typeof filters.maxPrice === 'number' ? filters.maxPrice : 15000; // Default max price


    return (
        <form 
            className={`${styles.filter_container} ${isMobileOpen ? styles.show : ''}`} 
            onSubmit={handleFilterSubmit}
        >
             {/* Use h2 class */}
            <h2 className={styles.h2} style={{ marginBottom: '30px' }}>Filter by</h2> 

             {/* Use button with specific class */}
            <button 
                type="button" 
                className={styles['close-filters']} 
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close filters"
            >
                &times; {/* Use times symbol for close */}
            </button>
            
            <FilterSection 
                title="Product Type" 
                options={productTypes} 
                name="productTypes" 
                filterState={filterState} 
                setFilterState={setFilterState} 
            />
             {/* Use hr class */}
            <hr className={styles.hr} /> 

            <FilterSection 
                title="Color" 
                options={colors} 
                name="colors" 
                filterState={filterState} 
                setFilterState={setFilterState} 
            />
             {/* Use hr class */}
            <hr className={styles.hr} />

            <FilterSection 
                title="Size" 
                options={sizes} 
                name="sizes" 
                filterState={filterState} 
                setFilterState={setFilterState} 
            />
             {/* Use hr class */}
            <hr className={styles.hr} />

            <div className={`${styles.filters} ${styles.price}`}>
                <div className={styles.heading_button}>
                     {/* Use h3 */}
                    <h3>Price</h3> 
                     {/* Use button class - disabled, always shown */}
                    <button type="button" className={styles['expand-button']} disabled> − </button> 
                </div>
                <div className={styles.price_filter_div}>
                     {/* Label is styled via CSS */}
                    <label htmlFor="price"> 
                        Max Price: <span>₹{filterState.maxPrice.toFixed(2)}</span>
                    </label>
                     {/* Use range-input class */}
                    <input 
                        type="range" 
                        id="price" 
                        name="price" 
                        min="0" 
                        max={maxPrice} // Use safe maxPrice
                        value={filterState.maxPrice}
                        onChange={handlePriceChange}
                        className={styles['range-input']}
                    />
                </div>
            </div>
             {/* Use hr class */}
            <hr className={styles.hr} />

             {/* Use button class with ID */}
            <button type="button" className={styles.button} id="clear-filters" onClick={handleClearFilters}>Clear Filters</button> 
            {/* Use button class with specific class */}
            <button type="submit" className={`${styles.button} ${styles['submit-button']}`}>Apply Filter</button> 
        </form>
    );
};

export default ProductFilters;