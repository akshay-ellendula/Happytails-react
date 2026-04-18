// pages/Home/components/Shop.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../../utils/axios";
import { Loader2, ShoppingBag, ArrowRight, Star, Eye } from "lucide-react";

const getDisplayProduct = (product) => {
  let variantToDisplay = null;

  if (product.variants && product.variants.length > 0) {
    variantToDisplay = product.variants.reduce((min, variant) => {
      if (min === null) return variant;
      const price = variant.sale_price ?? variant.regular_price;
      const minPrice = min.sale_price ?? min.regular_price;
      return price < minPrice ? variant : min;
    }, null);
  }

  if (!variantToDisplay || !variantToDisplay.regular_price) return null;

  const price = variantToDisplay.sale_price ?? variantToDisplay.regular_price;
  const regularPrice = variantToDisplay.regular_price;

  return {
    id: product.id,
    name: product.product_name,
    image_data: product.image_data
      ? product.image_data.startsWith("data:") || product.image_data.startsWith("http")
        ? product.image_data
        : "data:image/jpeg;base64," + product.image_data
      : "/api/placeholder/400/500",
    price,
    regularPrice,
  };
};

const Shop = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/products/getProducts");
        const rawProducts = res.data.products || [];
        setAllProducts(rawProducts.map(getDisplayProduct).filter(Boolean));
      } catch (error) {
        console.error("Error fetching homepage products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (allProducts.length === 0) return;
    const intervalId = setInterval(() => {
      setOffset((prev) => (prev + 3 >= allProducts.length ? 0 : prev + 3));
    }, 10000);
    return () => clearInterval(intervalId);
  }, [allProducts.length]);

  const productsToDisplay = allProducts.slice(offset, offset + 3);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-[#1a1a1a] relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-[#f2c737]/5 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-[#f2c737]/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f2c737]/10 border border-[#f2c737]/20 mb-4">
            <ShoppingBag className="w-4 h-4 text-[#f2c737]" />
            <span className="text-sm font-bold text-[#f2c737] uppercase tracking-wider">Curated Collection</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
            Premium Pet Shop
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Handpicked essentials and accessories your furry friend will absolutely love
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="lg:col-span-3 flex justify-center py-10">
              <Loader2 className="animate-spin w-8 h-8 text-[#f2c737]" />
            </div>
          ) : productsToDisplay.length > 0 ? (
            productsToDisplay.map((product, index) => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className={`group ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              >
                <div className="bg-[#2a2a2a] rounded-2xl overflow-hidden hover:shadow-[0_20px_60px_rgba(242,199,55,0.15)] transition-all duration-500 border border-white/5 hover:border-[#f2c737]/30 hover:-translate-y-2">
                  <div className="relative h-[300px] lg:h-[350px] overflow-hidden">
                    <img
                      src={product.image_data}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={product.name}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2a2a2a] via-transparent to-transparent opacity-60"></div>

                    {/* Sale badge */}
                    {product.price < product.regularPrice && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                        {Math.round((1 - product.price / product.regularPrice) * 100)}% OFF
                      </div>
                    )}

                    {/* Quick View overlay */}
                    <div className="absolute inset-0 bg-[#f2c737]/0 group-hover:bg-[#f2c737]/10 transition-colors duration-500 flex items-center justify-center">
                      <div className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full text-[#1a1a1a] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 shadow-xl">
                        <Eye className="w-4 h-4" />
                        Quick View
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#f2c737] text-[#f2c737]" />
                      ))}
                      <span className="text-white/40 text-xs ml-1">(4.8)</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#f2c737] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-[#f2c737]">
                        ₹{product.price.toFixed(0)}
                      </span>
                      {product.price < product.regularPrice && (
                        <span className="text-white/40 line-through text-sm">
                          ₹{product.regularPrice.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="lg:col-span-3 text-center py-20">
              <p className="text-lg text-white/40 font-medium">No products available.</p>
            </div>
          )}
        </div>

        {/* Dots */}
        {allProducts.length > 3 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(allProducts.length / 3) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setOffset(i * 3)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === Math.floor(offset / 3) ? 'w-8 bg-[#f2c737]' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className={`text-center mt-14 ${isVisible ? 'animate-fade-in-up delay-600' : 'opacity-0'}`}>
          <Link
            to="/pet_accessory"
            className="group inline-flex items-center gap-3 px-10 py-4 text-lg text-[#1a1a1a] bg-[#f2c737] rounded-full hover:shadow-[0_10px_40px_rgba(242,199,55,0.3)] transition-all duration-300 font-bold hover:scale-105"
          >
            View All Products
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Shop;