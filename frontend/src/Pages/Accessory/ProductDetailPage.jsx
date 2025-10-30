// src/Pages/Accessory/ProductDetailPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom'; // Use react-router-dom
import AccessoryNavbar from './components/AccessoryNavbar';
import AccessoryFooter from './components/AccessoryFooter';
import { axiosInstance } from '../../utils/axios'; // Import axiosInstance
// --- Import Social Icons ---
import { Facebook, Instagram, Twitter, ArrowLeft, ShoppingCart, Package, Star } from 'lucide-react';
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
                const response = await axiosInstance.get(`/products/getProduct/${id}`);

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
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">₹{currentVariant.sale_price.toFixed(2)}</span>
                    <span className="text-xl text-gray-400 line-through">₹{currentVariant.regular_price.toFixed(2)}</span>
                    <span className="px-2 py-1 bg-red-500 text-white text-sm font-semibold rounded">
                        SAVE {Math.round(((currentVariant.regular_price - currentVariant.sale_price) / currentVariant.regular_price) * 100)}%
                    </span>
                </div>
            );
        }
         // Ensure regular_price exists before calling toFixed
         return currentVariant.regular_price !== null ? <span className="text-3xl font-bold text-gray-900">₹{currentVariant.regular_price.toFixed(2)}</span> : "Price unavailable";
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#effe8b' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: '#effe8b' }}>
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg max-w-md">
                    <p className="text-red-800 font-semibold text-lg">Error: {error}</p>
                </div>
            </div>
        );
    }

    if (!product) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#effe8b' }}><p className="text-xl font-semibold text-gray-700">Product not found.</p></div>;

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

            <div className="min-h-screen font-['Outfit',sans-serif]" style={{ backgroundColor: '#effe8b' }}>
                {/* Back Navigation */}
                <div className="sticky top-0 z-10" style={{ backgroundColor: '#effe8b' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <Link 
                            to="/pet_accessory" 
                            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-semibold transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Accessories</span>
                        </Link>
                    </div>
                </div>

                {/* Product Container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-8 lg:pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Image Section */}
                        <div className="relative">
                            <div className="lg:sticky lg:top-24">
                                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white">
                                    <img
                                        src={product.image_data || '/images/default-product.jpg'}
                                        alt={product.product_name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-6">
                            {/* Product Title */}
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                                    {product.product_name}
                                </h1>
                            </div>

                            {/* Price */}
                            <div className="py-4 border-y border-gray-200">
                                {priceDisplay}
                            </div>

                            {/* Size Selector */}
                            {showSizeSelector && (
                                <div className="space-y-3">
                                    <label htmlFor="size" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Select Size
                                    </label>
                                    <select
                                        name="size"
                                        id="size"
                                        value={selectedSize}
                                        onChange={handleSizeChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-gray-900 bg-white"
                                    >
                                        <option value="default" disabled={availableSizes.length === 1}>Select Size</option>
                                        {availableSizes.map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Color Selector */}
                            {showColorSelector && (
                                <div className="space-y-3">
                                    <label htmlFor="color" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                        Select Color {isColorDisabled && <span className="text-gray-400 normal-case">(Select size first)</span>}
                                    </label>
                                    <select
                                        name="color"
                                        id="color"
                                        value={selectedColor}
                                        onChange={handleColorChange}
                                        disabled={isColorDisabled}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                         <option value="default" disabled={availableColors.length === 1 && !isColorDisabled}>
                                             {isColorDisabled ? 'Select size first' : 'Select Color'}
                                        </option>
                                        {/* Only map available colors based on selected size */}
                                        {!isColorDisabled && availableColors.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Quantity & Stock */}
                            <div className="space-y-3">
                                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        value={quantity}
                                        min="1"
                                        max={currentVariant?.stock_quantity ?? 1}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-24 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-center focus:outline-none focus:border-gray-900"
                                        aria-label="Quantity"
                                    />
                                    {currentVariant && (
                                        <div className="flex items-center gap-2">
                                            <Package className="w-5 h-5 text-gray-500" />
                                            <span className={`font-medium ${currentVariant.stock_quantity > 10 ? 'text-green-600' : currentVariant.stock_quantity > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                                                {currentVariant.stock_quantity > 0 ? `${currentVariant.stock_quantity} in stock` : 'Out of stock'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                id="addToCartBtn"
                                onClick={handleAddToCart}
                                disabled={!currentVariant || currentVariant.stock_quantity < 1}
                                className="w-full py-4 px-6 bg-gray-900 text-yellow-300 font-bold text-lg rounded-lg hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                            >
                                <ShoppingCart className="w-6 h-6" />
                                {currentVariant?.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>

                            {/* Cart Action Message */}
                            {showCartMessage && (
                                <div className={`p-4 rounded-lg font-semibold ${
                                    cartMessage.type === 'success' 
                                        ? 'bg-green-50 text-green-800 border border-green-200' 
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                }`} role="alert">
                                    {cartMessage.text}
                                </div>
                            )}

                            {/* Product Description (Optional) */}
                            {product.product_description && (
                                <div className="pt-6 border-t border-gray-200">
                                    <h4 className="text-xl font-bold text-gray-900 mb-3">Product Description</h4>
                                    <p className="text-gray-700 leading-relaxed">{product.product_description}</p>
                                </div>
                            )}

                            {/* Share Section */}
                            <div className="pt-6 border-t border-gray-200">
                                <h4 className="text-xl font-bold text-gray-900 mb-4">Share This Product</h4>
                                <div className="flex gap-4">
                                    <a 
                                        href="#" 
                                        aria-label="Share on Facebook"
                                        title="Share on Facebook"
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                                    >
                                        <Facebook className="w-6 h-6" />
                                    </a>
                                    <a 
                                        href="#" 
                                        aria-label="Share on Instagram"
                                        title="Share on Instagram"
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
                                    >
                                        <Instagram className="w-6 h-6" />
                                    </a>
                                    <a 
                                        href="#" 
                                        aria-label="Share on Twitter"
                                        title="Share on Twitter"
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-md hover:shadow-lg"
                                    >
                                        <Twitter className="w-6 h-6" />
                                    </a>
                                </div>
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