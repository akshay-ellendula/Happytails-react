// src/Pages/Accessory/ProductDetailPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../../components/Footer";
import { axiosInstance } from "../../utils/axios";
import { useCart } from "../../context/CartContext";
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import {
  Facebook,
  Instagram,
  Twitter,
  ArrowLeft,
  ShoppingCart,
  Package,
} from "lucide-react";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState("default");
  const [selectedColor, setSelectedColor] = useState("default");
  const [quantity, setQuantity] = useState(1);

  const [cartMessage, setCartMessage] = useState({ text: "", type: "error" });
  const [showCartMessage, setShowCartMessage] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const { openCart, addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get(`/products/getProduct/${id}`);

        console.log("API Response (Detail Page):", response.data);

        if (response.data.success) {
          setProduct(response.data.product);
          const variants = response.data.product?.variants || [];
          const uniqueSizes = [
            ...new Set(variants.map((v) => v.size).filter((s) => s !== null)),
          ];
          const uniqueColors = [
            ...new Set(variants.map((v) => v.color).filter((c) => c !== null)),
          ];
          if (uniqueSizes.length === 1) {
            setSelectedSize(uniqueSizes[0]);
          }
          if (uniqueColors.length === 1 && uniqueSizes.length <= 1) {
            setSelectedColor(uniqueColors[0]);
          }
        } else {
          setError(response.data.message || "Product not found.");
        }
      } catch (err) {
        const message =
          err.response?.data?.message ||
          `Network error: ${err.message}. Could not fetch product details.`;
        setError(message);
        console.error("Fetch product error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const availableSizes = useMemo(() => {
    if (!product) return [];
    return [
      ...new Set(product.variants.map((v) => v.size).filter((s) => s !== null)),
    ].sort();
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product) return [];
    const hasSizes = availableSizes.length > 0;
    if (!hasSizes) {
      return [
        ...new Set(
          product.variants.map((v) => v.color).filter((c) => c !== null)
        ),
      ].sort();
    }
    if (selectedSize !== "default") {
      return [
        ...new Set(
          product.variants
            .filter((v) => v.size === selectedSize && v.color !== null)
            .map((v) => v.color)
        ),
      ].sort();
    }
    return [];
  }, [product, selectedSize, availableSizes]);

  const currentVariant = useMemo(() => {
    if (!product) return null;
    const hasSizes = availableSizes.length > 0;
    const hasColors = product.variants.some((v) => v.color !== null);
    let variant = product.variants.find(
      (v) =>
        (!hasSizes || v.size === selectedSize) &&
        (!hasColors || v.color === selectedColor)
    );
    if (
      !variant &&
      hasSizes &&
      selectedSize !== "default" &&
      (!hasColors || selectedColor === "default")
    ) {
      const sizeVariants = product.variants.filter(
        (v) => v.size === selectedSize
      );
      variant =
        sizeVariants.find((v) => v.sale_price !== null) || sizeVariants[0];
    }
    if (!variant && !hasSizes && hasColors && selectedColor !== "default") {
      variant = product.variants.find((v) => v.color === selectedColor);
    }
    return variant || product.variants[0];
  }, [product, selectedSize, selectedColor, availableSizes]);

  const priceDisplay = useMemo(() => {
    if (!currentVariant) return "Price unavailable";
    if (
      currentVariant.sale_price !== null &&
      currentVariant.sale_price < currentVariant.regular_price
    ) {
      return (
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gray-900">
            ₹{currentVariant.sale_price.toFixed(2)}
          </span>
          <span className="text-xl text-gray-400 line-through">
            ₹{currentVariant.regular_price.toFixed(2)}
          </span>
          <span className="px-2 py-1 bg-red-500 text-white text-sm font-semibold rounded">
            SAVE{" "}
            {Math.round(
              ((currentVariant.regular_price - currentVariant.sale_price) /
                currentVariant.regular_price) *
                100
            )}
            %
          </span>
        </div>
      );
    }
    return currentVariant.regular_price !== null ? (
      <span className="text-3xl font-bold text-gray-900">
        ₹{currentVariant.regular_price.toFixed(2)}
      </span>
    ) : (
      "Price unavailable"
    );
  }, [currentVariant]);

  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
    setSelectedColor("default");
    setShowCartMessage(false);
  };

  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
    setShowCartMessage(false);
  };

  const displayMessage = (text, type = "error") => {
    setCartMessage({ text, type });
    setShowCartMessage(true);
    setTimeout(() => setShowCartMessage(false), 4000);
  };

  const handleAddToCart = () => {
    setShowCartMessage(false);
    const hasSizes = availableSizes.length > 0;
    const hasColors = product.variants.some((v) => v.color !== null);

    if (hasSizes && selectedSize === "default") {
      displayMessage("Please select a size.");
      return;
    }
    if (
      hasColors &&
      availableColors.length > 0 &&
      selectedColor === "default"
    ) {
      displayMessage("Please select a color.");
      return;
    }
    if (!currentVariant) {
      displayMessage(
        "Could not determine the product variant. Please try again."
      );
      return;
    }

    const result = addToCart(product, currentVariant, quantity);

    if (result.success) {
      displayMessage(result.message, "success");
    } else {
      displayMessage(result.message, "error");
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f2c737" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5"
        style={{ backgroundColor: "#f2c737" }}
      >
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-lg max-w-md">
          <p className="text-red-800 font-semibold text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!product)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f2c737" }}
      >
        <p className="text-xl font-semibold text-gray-700">
          Product not found.
        </p>
      </div>
    );

  const showSizeSelector = availableSizes.length > 0;
  const showColorSelector = product.variants.some((v) => v.color !== null);
  const isColorDisabled = showSizeSelector && selectedSize === "default";

  return (
    <>
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}

      <div
        className="min-h-screen font-['Outfit',sans-serif]"
        style={{ backgroundColor: "#f2c737" }}
      >
        <div
          className="sticky top-0 z-10"
          style={{ backgroundColor: "#f2c737" }}
        >
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-8 lg:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative">
              <div className="lg:sticky lg:top-24">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white">
                  <img
                    src={product.image_data || "/images/default-product.jpg"}
                    alt={product.product_name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                  {product.product_name}
                </h1>
              </div>

              <div className="py-4 border-y border-gray-200">
                {priceDisplay}
              </div>

              {showSizeSelector && (
                <div className="space-y-3">
                  <label
                    htmlFor="size"
                    className="block text-sm font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    Select Size
                  </label>
                  <select
                    name="size"
                    id="size"
                    value={selectedSize}
                    onChange={handleSizeChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-gray-900 bg-white"
                  >
                    <option
                      value="default"
                      disabled={availableSizes.length === 1}
                    >
                      Select Size
                    </option>
                    {availableSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showColorSelector && (
                <div className="space-y-3">
                  <label
                    htmlFor="color"
                    className="block text-sm font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    Select Color{" "}
                    {isColorDisabled && (
                      <span className="text-gray-400 normal-case">
                        (Select size first)
                      </span>
                    )}
                  </label>
                  <select
                    name="color"
                    id="color"
                    value={selectedColor}
                    onChange={handleColorChange}
                    disabled={isColorDisabled}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-gray-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option
                      value="default"
                      disabled={
                        availableColors.length === 1 && !isColorDisabled
                      }
                    >
                      {isColorDisabled ? "Select size first" : "Select Color"}
                    </option>
                    {!isColorDisabled &&
                      availableColors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="space-y-3">
                <label
                  htmlFor="quantity"
                  className="block text-sm font-semibold text-gray-700 uppercase tracking-wide"
                >
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
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-24 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-center focus:outline-none focus:border-gray-900"
                    aria-label="Quantity"
                  />
                  {currentVariant && (
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-gray-500" />
                      <span
                        className={`font-medium ${
                          currentVariant.stock_quantity > 10
                            ? "text-green-600"
                            : currentVariant.stock_quantity > 0
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {currentVariant.stock_quantity > 0
                          ? `${currentVariant.stock_quantity} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                id="addToCartBtn"
                onClick={handleAddToCart}
                disabled={!currentVariant || currentVariant.stock_quantity < 1}
                className="w-full py-4 px-6 bg-gray-900 text-[#f2c737] font-bold text-lg rounded-lg hover:bg-gray-800 transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart className="w-6 h-6" />
                {currentVariant?.stock_quantity > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </button>

              {showCartMessage && (
                <div
                  className={`p-4 rounded-lg font-semibold ${
                    cartMessage.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                  role="alert"
                >
                  {cartMessage.text}
                </div>
              )}

              {product.product_description && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">
                    Product Description
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {product.product_description}
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Share This Product
                </h4>
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

      <Footer />
    </>
  );
};

export default ProductDetailPage;