// src/Pages/Accessory/ProductDetailPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom'; // Use react-router-dom
import styles from './ProductDetailPage.module.css';
import AccessoryNavbar from './components/AccessoryNavbar';
import AccessoryFooter from './components/AccessoryFooter';
import { axiosInstance } from '../../utils/axios'; // Import axiosInstance
// --- Import Social Icons ---
import { Facebook, Instagram, Twitter } from 'lucide-react';
// --- End Import ---

const ProductDetailPage = ({ user }) => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for user selections
    const [selectedSize, setSelectedSize] = useState('default');
    const [selectedColor, setSelectedColor] = useState('default');
    const [quantity, setQuantity] = useState(1);

    // State for UI feedback
    const [cartMessage, setCartMessage] = useState({ text: '', type: 'error' });
    const [showCartMessage, setShowCartMessage] = useState(false);

    // State to control cart sidebar (potentially lift this up later)
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Fetch product data on component mount
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null); // Clear previous errors

                // Use axiosInstance to fetch product data
                const response = await axiosInstance.get(`/products/product/${id}`);

                console.log("API Response (Detail Page):", response.data); // Debug log

                if (response.data.success) {
                    setProduct(response.data.product);
                    // Pre-select defaults if only one option exists
                    const variants = response.data.product?.variants || [];
                    const uniqueSizes = [...new Set(variants.map(v => v.size).filter(s => s !== null))];
                    const uniqueColors = [...new Set(variants.map(v => v.color).filter(c => c !== null))];
                    if (uniqueSizes.length === 1) {
                        setSelectedSize(uniqueSizes[0]);
                    }
                    if (uniqueColors.length === 1 && uniqueSizes.length <= 1) { // Only preselect color if size is also single or non-existent
                        setSelectedColor(uniqueColors[0]);
                    }

                } else {
                    setError(response.data.message || 'Product not found.');
                }

            } catch (err) {
                 // Axios errors have a 'response' property for server errors
                const message = err.response?.data?.message || `Network error: ${err.message}. Could not fetch product details.`;
                setError(message);
                console.error("Fetch product error:", err.response?.data || err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]); // Dependency array ensures fetch runs when 'id' changes

    // --- Reactive Logic ---

    // Get available sizes
     const availableSizes = useMemo(() => {
        if (!product) return [];
        return [...new Set(product.variants.map(v => v.size).filter(s => s !== null))].sort(); // Sort for consistent order
    }, [product]);

    // Get available colors based on selected size
    const availableColors = useMemo(() => {
        if (!product) return [];
        const hasSizes = availableSizes.length > 0;

        // If no sizes exist, show all available colors
        if (!hasSizes) {
            return [...new Set(product.variants.map(v => v.color).filter(c => c !== null))].sort();
        }

        // If a size is selected, filter colors for that size
        if (selectedSize !== 'default') {
            return [...new Set(
                product.variants
                    .filter(v => v.size === selectedSize && v.color !== null)
                    .map(v => v.color)
            )].sort();
        }

        // If size exists but none is selected, show no colors yet
        return [];
    }, [product, selectedSize, availableSizes]);


    // Get the currently selected variant based on size and color
    const currentVariant = useMemo(() => {
        if (!product) return null;
        const hasSizes = availableSizes.length > 0;
        const hasColors = product.variants.some(v => v.color !== null); // Check if *any* variant has a color

        // Find variant matching selected size and color
        let variant = product.variants.find(v =>
            (!hasSizes || v.size === selectedSize) &&
            (!hasColors || v.color === selectedColor)
        );

         // Fallback logic if only size is selected and color isn't applicable/chosen yet
        if (!variant && hasSizes && selectedSize !== 'default' && (!hasColors || selectedColor === 'default')) {
            // Find the first variant matching the size (prefer one with sale price if multiple)
            const sizeVariants = product.variants.filter(v => v.size === selectedSize);
            variant = sizeVariants.find(v => v.sale_price !== null) || sizeVariants[0];
        }

         // Fallback logic if only color is selected (when no sizes exist)
         if (!variant && !hasSizes && hasColors && selectedColor !== 'default') {
             variant = product.variants.find(v => v.color === selectedColor);
         }


        // Final fallback to the very first variant if no specific match
        return variant || product.variants[0];
    }, [product, selectedSize, selectedColor, availableSizes]);

    // Create the price display string/JSX
    const priceDisplay = useMemo(() => {
        if (!currentVariant) return "Price unavailable"; // Handle case where no variant is found

        if (currentVariant.sale_price !== null && currentVariant.sale_price < currentVariant.regular_price) {
            return (
                <>
                    ₹{currentVariant.sale_price.toFixed(2)}{' '}
                    <span className={styles.strikethrough}>₹{currentVariant.regular_price.toFixed(2)}</span>
                </>
            );
        }
         // Ensure regular_price exists before calling toFixed
         return currentVariant.regular_price !== null ? `₹${currentVariant.regular_price.toFixed(2)}` : "Price unavailable";
    }, [currentVariant]);


    // --- Event Handlers ---

    const handleSizeChange = (e) => {
        setSelectedSize(e.target.value);
        setSelectedColor('default'); // Reset color when size changes
        setShowCartMessage(false); // Hide any previous messages
    };

    const handleColorChange = (e) => {
        setSelectedColor(e.target.value);
        setShowCartMessage(false); // Hide any previous messages
    };

    const displayMessage = (text, type = 'error') => {
        setCartMessage({ text, type });
        setShowCartMessage(true);
        // Automatically hide after a delay
        setTimeout(() => setShowCartMessage(false), 4000);
    };

    const handleAddToCart = () => {
        setShowCartMessage(false); // Clear previous message
        const hasSizes = availableSizes.length > 0;
        const hasColors = product.variants.some(v => v.color !== null);

        // Validation based on selections
        if (hasSizes && selectedSize === 'default') {
            displayMessage('Please select a size.');
            return;
        }
        // Only require color selection if colors are available *for the selected size* (or if no sizes exist)
        if (hasColors && availableColors.length > 0 && selectedColor === 'default') {
            displayMessage('Please select a color.');
            return;
        }

        // Find the specific variant to add based on current selections
         const variantToAdd = product.variants.find(v =>
            (!hasSizes || v.size === selectedSize) &&
            (!hasColors || v.color === selectedColor) // This condition might need refinement if a product has size OR color but not both
        );


        // Re-check: If colors exist but aren't relevant for the selected size, variantToAdd might be found too early.
        // Let's refine the check based on currentVariant which already has fallback logic.
        if (!currentVariant) {
             displayMessage('Could not determine the product variant. Please try again.');
             return;
        }

        // Check stock
        if (currentVariant.stock_quantity < quantity) {
            displayMessage(`Only ${currentVariant.stock_quantity} left in stock for the selected options.`);
            return;
        }

        // Prepare item for cart
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const image_data = product.image_data; // Use the image data fetched for the product

        const cartItem = {
            product_id: product.id,
            variant_id: currentVariant.variant_id, // Use the determined currentVariant's ID
            product_name: product.product_name,
            price: currentVariant.sale_price !== null ? currentVariant.sale_price : currentVariant.regular_price,
            size: currentVariant.size, // Use size from currentVariant
            color: currentVariant.color, // Use color from currentVariant
            quantity: parseInt(quantity),
            image_data: image_data // Store image data with the cart item
        };

        // Check if item already exists in cart (same product and variant)
        const existingItemIndex = cart.findIndex(item =>
            item.product_id === cartItem.product_id &&
            item.variant_id === cartItem.variant_id
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            const newQuantity = cart[existingItemIndex].quantity + cartItem.quantity;
            // Check stock again for combined quantity
            if (currentVariant.stock_quantity < newQuantity) {
                 displayMessage(`Cannot add ${cartItem.quantity} more; only ${currentVariant.stock_quantity - cart[existingItemIndex].quantity} additional items available in stock.`);
                 return;
            }
            cart[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item if it doesn't exist
            cart.push(cartItem);
        }

        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        displayMessage(`Added ${quantity} "${product.product_name}" ${currentVariant.size ? `(${currentVariant.size})` : ''} ${currentVariant.color ? `(${currentVariant.color})` : ''} to cart!`, 'success');

        // Optional: Open the cart sidebar after adding
        // setIsCartOpen(true);
    };

    // --- Render Logic ---

    if (loading) return <div>Loading product details...</div>; // More informative loading message
    if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>; // Display error clearly
    if (!product) return <div>Product not found.</div>;

    // Determine if selectors should be shown
    const showSizeSelector = availableSizes.length > 0;
    // Show color selector if colors exist *at all* for this product,
    // but disable it until a size is chosen if sizes also exist.
    const showColorSelector = product.variants.some(v => v.color !== null);
    const isColorDisabled = showSizeSelector && selectedSize === 'default';


    return (
        <>
            {/* Pass user and cart state control to Navbar */}
            <AccessoryNavbar user={user} setIsCartOpen={setIsCartOpen} />

            {/* TODO: Add CartSidebar component here, passing relevant props */}
            {/* <CartSidebar isOpen={isCartOpen} setIsOpen={setIsCartOpen} ... /> */}

            {/* Product Details Container */}
            <div className={styles.container}>
                <div className={styles.wrapper}>
                    {/* Back Navigation */}
                    <div className={styles.mini_nav}>
                        <span> &lt; </span>
                        <Link to="/pet_accessory">Back to Accessories</Link>
                    </div>

                    {/* Product Layout */}
                    <div className={styles.product_container}>
                        {/* Image Column */}
                        <div className={styles.image_container}>
                            <img
                                src={product.image_data || '/images/default-product.jpg'} // Use fetched image data
                                alt={product.product_name}
                            />
                        </div>

                        {/* Details Column */}
                        <div className={styles.product_details} data-product-id={product.id}>
                            <h1 className={styles.h1}>{product.product_name}</h1>

                            {/* Price */}
                            <p className={styles.p} id="priceDisplay">
                                {priceDisplay}
                            </p>

                            {/* Size Selector */}
                            {showSizeSelector && (
                                <>
                                    <label htmlFor="size">Size:</label>
                                    <select
                                        name="size"
                                        id="size"
                                        value={selectedSize}
                                        onChange={handleSizeChange}
                                        className={styles.select}
                                    >
                                        <option value="default" disabled={availableSizes.length === 1}>Select Size</option>
                                        {availableSizes.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {/* Color Selector */}
                            {showColorSelector && (
                                <>
                                    <label htmlFor="color">Color:</label>
                                    <select
                                        name="color"
                                        id="color"
                                        value={selectedColor}
                                        onChange={handleColorChange}
                                        disabled={isColorDisabled} // Disable if size needed but not selected
                                        className={styles.select}
                                    >
                                         <option value="default" disabled={availableColors.length === 1 && !isColorDisabled}>
                                             {isColorDisabled ? 'Select size first' : 'Select Color'}
                                        </option>
                                        {/* Only map available colors based on selected size */}
                                        {!isColorDisabled && availableColors.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {/* Quantity Input */}
                            <label htmlFor="quantity">Quantity:</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity" // Add name attribute
                                value={quantity}
                                min="1"
                                max={currentVariant?.stock_quantity ?? 1} // Set max based on stock
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} // Ensure positive integer
                                className={styles.input}
                                aria-label="Quantity"
                            />
                             {/* Display Stock (Optional) */}
                             {currentVariant && <p style={{ fontSize: '0.9em', color: '#555', marginTop: '-5px', marginBottom: '15px' }}>
                                {currentVariant.stock_quantity > 0 ? `${currentVariant.stock_quantity} in stock` : 'Out of stock'}
                             </p>}


                            {/* Add to Cart Button - disable if out of stock */}
                            <button
                                id="addToCartBtn"
                                onClick={handleAddToCart}
                                className={styles.button}
                                disabled={!currentVariant || currentVariant.stock_quantity < 1} // Disable if no variant or out of stock
                            >
                                {currentVariant?.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>

                            {/* Cart Action Message */}
                            {showCartMessage && (
                                <p className={`${styles.p} ${styles[cartMessage.type]}`} role="alert">
                                    {cartMessage.text}
                                </p>
                            )}

                            {/* Product Description (Optional) */}
                            {product.product_description && (
                                <div style={{ marginTop: '20px' }}>
                                    <h4 className={styles.h4}>Description:</h4>
                                    <p className={styles.p} style={{ fontSize: '1rem' }}>{product.product_description}</p>
                                </div>
                            )}


                            {/* Share Section */}
                            <div style={{ marginTop: '20px' }}>
                                <h4 className={styles.h4}>Share:</h4>
                            </div>
                            <div className={styles.socials}>
                                <a href="#" aria-label="Share on Facebook" title="Share on Facebook">
                                    <Facebook size={32} strokeWidth={1.5} /> {/* Adjust size/stroke */}
                                </a>
                                <a href="#" aria-label="Share on Instagram" title="Share on Instagram">
                                    <Instagram size={32} strokeWidth={1.5} />
                                </a>
                                <a href="#" aria-label="Share on Twitter" title="Share on Twitter">
                                    <Twitter size={32} strokeWidth={1.5} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AccessoryFooter />
        </>
    );
};

export default ProductDetailPage;