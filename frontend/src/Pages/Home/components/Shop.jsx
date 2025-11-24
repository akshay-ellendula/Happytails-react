import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { axiosInstance } from '../../../utils/axios';
import { Loader2 } from 'lucide-react'; 

// Helper function to find the lowest price variant and format product data for display (Remains the same)
const getDisplayProduct = (product) => {
  let variantToDisplay = null;

  if (product.variants && product.variants.length > 0) {
    // Find the variant with the lowest price (sale_price preferred)
    variantToDisplay = product.variants.reduce((min, variant) => {
      // FIX START: Handle the initial case where 'min' is null
      if (min === null) {
          return variant; 
      }
      // FIX END

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
        ? product.image_data.startsWith('data:') 
            ? product.image_data 
            : 'data:image/jpeg;base64,' + product.image_data 
        : '/images/default-product.jpg',
    price: price, 
    regularPrice: regularPrice 
  };
};

const Shop = () => {
  // Store the full list of available products after processing
  const [allProducts, setAllProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // NEW: State to track the starting index for slicing (0, 3, 6, 9, ...)
  const [offset, setOffset] = useState(0); 

  // --- Initial Data Fetching ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get('/products/getProducts');
        const rawProducts = res.data.products || [];
        
        // Process all products once
        const processedProducts = rawProducts
          .map(getDisplayProduct)
          .filter(p => p !== null); 
        
        setAllProducts(processedProducts); // Store the full list
        setLoading(false);
      } catch (error) {
        console.error("Error fetching homepage products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- Carousel Logic (Runs when allProducts is ready) ---
  useEffect(() => {
    if (allProducts.length === 0) return;
    
    // Calculate the maximum starting offset (last group of 3)
    const maxOffset = allProducts.length - (allProducts.length % 3 === 0 ? 3 : allProducts.length % 3);
    
    // Set interval to rotate products every 10 seconds (10000ms)
    const intervalId = setInterval(() => {
      setOffset(prevOffset => {
        const nextOffset = prevOffset + 3;
        // Reset to 0 if the next offset exceeds the total number of products
        // or if it exceeds the maximum sensible starting point
        if (nextOffset >= allProducts.length) {
          return 0; 
        }
        return nextOffset;
      });
    }, 10000); 

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [allProducts.length]); 

  // --- Rendering Logic ---
  const productsToDisplay = allProducts.slice(offset, offset + 3);

  return (
    <section className="slide-up mx-5 lg:mx-[75px] my-12 text-center bg-[#effe8b]">
      <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-[#1a1a1a]">Shop</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto min-h-[500px]"> 
        {loading ? (
           <div className="lg:col-span-3 flex justify-center py-10">
               <Loader2 className="animate-spin w-8 h-8 text-[#1a1a1a]"/>
           </div>
        ) : productsToDisplay.length > 0 ? (
          productsToDisplay.map((product) => (
            <Link 
                to={`/product/${product.id}`} // Link to the detail page
                key={product.id} 
                className="no-underline text-inherit"
            >
                <article className="border-2 border-black rounded-lg shadow-md overflow-hidden group hover:shadow-xl transition-shadow bg-white h-full flex flex-col">
                  <div className="relative h-[300px] lg:h-[450px] overflow-hidden flex-grow">
                    <img 
                      src={product.image_data} // Dynamic image src
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt={product.name} 
                    />
                    <div className="absolute inset-x-0 bottom-0 h-[75px] bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center text-xl cursor-pointer font-semibold text-[#1a1a1a] border-t-2 border-black">
                      Quick View
                    </div>
                  </div>
                  <div className="p-4 flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-[#1a1a1a] mt-4">{product.name}</h3>
                    <p className="mb-4 text-lg text-[#1a1a1a] mt-2">
                         {/* Dynamic Price Display */}
                         {product.price < product.regularPrice ? (
                            <>
                                <span className="font-bold">₹{product.price.toFixed(2)}</span>
                                <span className="text-gray-500 line-through ml-2">₹{product.regularPrice.toFixed(2)}</span>
                            </>
                         ) : (
                             <span className="font-bold">₹{product.price.toFixed(2)}</span>
                         )}
                    </p>
                  </div>
                </article>
            </Link>
          ))
        ) : (
            <div className="lg:col-span-3 text-lg text-gray-600">No products available to display.</div>
        )}
      </div>
      
      <Link 
        to="/pet_accessory"
        className="mt-10 px-8 py-3 text-xl text-white bg-[#1a1a1a] border border-[#1a1a1a] rounded-full transition-all duration-300 hover:bg-transparent hover:text-[#1a1a1a] font-semibold inline-block"
      >
        View All Products
      </Link>
    </section>
  );
};

export default Shop;