import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import styles from './ProductDetailPage.module.css'; // This path is correct
import AccessoryNavbar from './components/AccessoryNavbar'; // <-- CORRECTED IMPORT
import AccessoryFooter from './components/AccessoryFooter'; // <-- CORRECTED IMPORT

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
    
    // You'll need to lift this state up to App.js or context if you
    // want the navbar icon to open the cart from this page.
    const [isCartOpen, setIsCartOpen] = useState(false); 

    // Fetch product data on component mount
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/products/product/${id}`);
                const data = await response.json();
                
                if (data.success) {
                    setProduct(data.product);
                } else {
                    setError(data.message || 'Product not found.');
                }
            } catch (err) {
                setError('Failed to fetch product.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // --- Reactive Logic ---

    // Get available colors based on selected size
    const availableColors = useMemo(() => {
        if (!product) return [];
        const hasSizes = product.variants.some(v => v.size !== null);
        if (!hasSizes) {
            return [...new Set(product.variants.map(v => v.color).filter(c => c !== null))];
        }
        if (selectedSize === 'default') {
            return [];
        }
        return [...new Set(
            product.variants
                .filter(v => v.size === selectedSize && v.color !== null)
                .map(v => v.color)
        )];
    }, [product, selectedSize]);

    // Get the currently selected variant
    const currentVariant = useMemo(() => {
        if (!product) return null;
        const hasSizes = product.variants.some(v => v.size !== null);
        const hasColors = product.variants.some(v => v.color !== null);

        let variant = product.variants.find(v => 
            (!hasSizes || v.size === selectedSize) &&
            (!hasColors || v.color === selectedColor)
        );

        if (!variant && hasSizes && selectedSize !== 'default' && selectedColor === 'default') {
             variant = product.variants.find(v => v.size === selectedSize);
        }
        
        return variant || product.variants[0]; 
    }, [product, selectedSize, selectedColor]);

    // Create the price display
    const priceDisplay = useMemo(() => {
        if (!currentVariant) return null;
        
        if (currentVariant.sale_price !== null) {
            return (
                <>
                    ₹{currentVariant.sale_price.toFixed(2)} <span className={styles.strikethrough}>₹{currentVariant.regular_price.toFixed(2)}</span>
                </>
            );
        }
        return `₹${currentVariant.regular_price.toFixed(2)}`;
    }, [currentVariant]);


    // --- Event Handlers ---

    const handleSizeChange = (e) => {
        setSelectedSize(e.target.value);
        setSelectedColor('default'); 
    };
    
    const handleColorChange = (e) => {
        setSelectedColor(e.target.value);
    };

    const displayMessage = (text, type = 'error') => {
        setCartMessage({ text, type });
        setShowCartMessage(true);
        setTimeout(() => setShowCartMessage(false), 3000);
    };

    const handleAddToCart = () => {
        const hasSizes = product.variants.some(v => v.size !== null);
        const hasColors = product.variants.some(v => v.color !== null);

        if (hasSizes && selectedSize === 'default') {
            displayMessage('Please select a size.');
            return;
        }
        if (hasColors && selectedColor === 'default') {
            displayMessage('Please select a color.');
            return;
        }

        const variantToAdd = product.variants.find(v => 
            (!hasSizes || v.size === selectedSize) &&
            (!hasColors || v.color === selectedColor)
        );

        if (!variantToAdd || variantToAdd.stock_quantity < quantity) {
            displayMessage('Not enough stock or invalid selection.');
            return;
        }

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // EJS image logic
        const image_data = product.image_data 
            ? (product.image_data.startsWith('data:') 
                ? product.image_data 
                : 'data:image/jpeg;base64,' + product.image_data)
            : null;

        const cartItem = {
            product_id: product.id,
            variant_id: variantToAdd.variant_id,
            product_name: product.product_name,
            price: variantToAdd.sale_price !== null ? variantToAdd.sale_price : variantToAdd.regular_price,
            size: variantToAdd.size,
            color: variantToAdd.color,
            quantity: parseInt(quantity),
            image_data: image_data
        };

        const existingItemIndex = cart.findIndex(item => 
            item.product_id === cartItem.product_id && 
            item.variant_id === cartItem.variant_id
        );

        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += cartItem.quantity;
        } else {
            cart.push(cartItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        displayMessage(`Added ${quantity} ${product.product_name} to cart!`, 'success');
    };

    // --- Render Logic ---

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found.</div>;

    const showSize = product.variants.some(v => v.size !== null);
    const showColor = product.variants.some(v => v.color !== null);

    return (
        <>
            {/* 1. USE YOUR IMPORTED COMPONENT */}
            <AccessoryNavbar user={user} setIsCartOpen={setIsCartOpen} />
            
            {/* (You will need to add your CartSidebar component here too) */}
            
            {/* Product Details Container */}
            <div className={styles.container}>
                <div className={styles.wrapper}>
                    <div className={styles.mini_nav}>
                        <span> &lt; </span>
                        <Link to="/pet_accessory">Back</Link>
                    </div>
                    <div className={styles.product_container}>
                        <div className={styles.image_container}>
                            <img 
                                src={product.image_data || '/images/default-product.jpg'}
                                alt={product.product_name}
                            />
                        </div>
                        <div className={styles.product_details} data-product-id={product.id}>
                            <h1 className={styles.h1}>{product.product_name}</h1>
                            <p className={styles.p} id="priceDisplay">
                                {priceDisplay}
                            </p>

                            {showSize && (
                                <>
                                    <label htmlFor="size">Size</label>
                                    <select 
                                        name="size" 
                                        id="size" 
                                        value={selectedSize} 
                                        onChange={handleSizeChange}
                                        className={styles.select}
                                    >
                                        <option value="default">Select Size</option>
                                        {[...new Set(product.variants.map(v => v.size).filter(s => s !== null))].map(size => (
                                            <option key={size} value={size}>{size}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            {showColor && (
                                <>
                                    <label htmlFor="color">Color</label>
                                    <select 
                                        name="color" 
                                        id="color" 
                                        value={selectedColor} 
                                        onChange={handleColorChange}
                                        disabled={availableColors.length === 0 && showSize}
                                        className={styles.select}
                                    >
                                        <option value="default">Select Color</option>
                                        {availableColors.map(color => (
                                            <option key={color} value={color}>{color}</option>
                                        ))}
                                    </select>
                                </>
                            )}

                            <label htmlFor="quantity">Quantity</label>
                            <input 
                                type="number" 
                                id="quantity" 
                                value={quantity} 
                                min="1" 
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                className={styles.input}
                            />
                            
                            <button id="addToCartBtn" onClick={handleAddToCart} className={styles.button}>
                                Add to Cart
                            </button>
                            
                            {showCartMessage && (
                                <p className={`${styles.p} ${styles[cartMessage.type]}`}>
                                    {cartMessage.text}
                                </p>
                            )}
                            
                            <div>
                                <h4 className={styles.h4}>Share:</h4>
                            </div>
                            <div className={styles.socials}>
                                <a href="#"><img src="/icons/facebook-3-logo-svgrepo-com.svg" alt="Facebook" /></a>
                                <a href="#"><img src="/icons/instagram-2016-logo-svgrepo-com.svg" alt="Instagram" /></a>
                                <a href="#"><img src="/icons/twitter-svgrepo-com.svg" alt="Twitter" /></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. USE YOUR IMPORTED COMPONENT */}
            <AccessoryFooter />
        </>
    );
};

export default ProductDetailPage;