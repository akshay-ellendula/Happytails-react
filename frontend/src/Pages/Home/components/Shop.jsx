// pages/Home/components/Shop.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../../utils/axios";
import { Loader2 } from "lucide-react";

const getDisplayProduct = (product) => {
  let variantToDisplay = null;

  if (product.variants && product.variants.length > 0) {
    variantToDisplay = product.variants.reduce((min, variant) => {
      if (min === null) {
        return variant;
      }

      const price = variant.sale_price ?? variant.regular_price;
      const minPrice = min.sale_price ?? min.regular_price;

      return price < minPrice ? variant : min;
    }, null);
  }

  if (!variantToDisplay || !variantToDisplay.regular_price) {
    return null;
  }

  const price = variantToDisplay.sale_price ?? variantToDisplay.regular_price;
  const regularPrice = variantToDisplay.regular_price;

  return {
    id: product.id,
    name: product.product_name,
    image_data: product.image_data
      ? product.image_data.startsWith("data:") ||
        product.image_data.startsWith("http")
        ? product.image_data
        : "data:image/jpeg;base64," + product.image_data
      : "/api/placeholder/400/500",
    price: price,
    regularPrice: regularPrice,
  };
};

const Shop = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/products/getProducts");
        const rawProducts = res.data.products || [];

        const processedProducts = rawProducts
          .map(getDisplayProduct)
          .filter((p) => p !== null);

        setAllProducts(processedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching homepage products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (allProducts.length === 0) return;

    const intervalId = setInterval(() => {
      setOffset((prevOffset) => {
        const nextOffset = prevOffset + 3;
        if (nextOffset >= allProducts.length) {
          return 0;
        }
        return nextOffset;
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [allProducts.length]);

  const productsToDisplay = allProducts.slice(offset, offset + 3);

  return (
    <section className="py-16 lg:py-24 bg-[#f2c737]">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-[#1a1a1a] text-center">
          Shop
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="lg:col-span-3 flex justify-center py-10">
              <Loader2 className="animate-spin w-8 h-8 text-[#1a1a1a]" />
            </div>
          ) : productsToDisplay.length > 0 ? (
            productsToDisplay.map((product) => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border-2 border-black">
                  <div className="relative h-[300px] lg:h-[350px] overflow-hidden">
                    <img
                      src={product.image_data}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      alt={product.name}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-[75px] bg-[#f2c737]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center text-xl cursor-pointer font-semibold text-[#1a1a1a] border-t-2 border-black">
                      Quick View
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-[#1a1a1a] mb-2">
                      {product.name}
                    </h3>
                    <p className="text-lg">
                      {product.price < product.regularPrice ? (
                        <>
                          <span className="font-bold text-[#1a1a1a]">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="text-gray-500 line-through ml-2 text-sm">
                            ₹{product.regularPrice.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-[#1a1a1a]">
                          ₹{product.price.toFixed(2)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="lg:col-span-3 text-center py-20">
              <p className="text-lg text-gray-600">No products available.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/pet_accessory"
            className="inline-block px-8 py-3 text-lg text-white bg-[#1a1a1a] border-2 border-black rounded-full hover:bg-transparent hover:text-[#1a1a1a] transition-colors font-semibold"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Shop;