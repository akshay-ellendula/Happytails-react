// ProductAccessoryPageWrapper.jsx
import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../utils/axios'; // Adjust path if needed
import ProductAccessoryPage from './ProductAccessoryPage';

const ProductAccessoryPageWrapper = () => {
    const [pageData, setPageData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProductData = async () => {
            setIsLoading(true); // Start loading
            setError(null); // Clear previous errors
            try {
                // Fetch from the API endpoint
                const response = await axiosInstance.get('/products/getProducts');
                console.log("API Response:", response.data); // Debug log
                if (response.data.success) {
                    setPageData({
                        user: response.data.user,
                        productsData: response.data.products || [],
                        // Ensure filters has a default structure
                        filters: response.data.filters || { maxPrice: 0, productTypes: [], colors: [], sizes: [] }
                    });
                } else {
                    setError("Failed to load product data from the server.");
                    console.error("API Error:", response.data.message);
                }
            } catch (err) {
                 setError(`Network error: ${err.message}. Could not connect to the backend.`);
                 console.error("Network error:", err);
            } finally {
                setIsLoading(false); // Stop loading
            }
        };

        fetchProductData();
    }, []); // Empty array ensures this runs only once when the component mounts

    // --- Render loading/error states ---
    if (isLoading) {
        return <div>Loading Accessories... Please wait.</div>;
    }

    if (error) {
        return <div>Error loading page: {error}</div>;
    }

    // Ensure pageData and essential filter data exist before rendering
    if (!pageData || !pageData.filters || typeof pageData.filters.maxPrice === 'undefined') {
         console.error("Received incomplete data from backend:", pageData);
         return <div>Error: Incomplete data received from the server. Cannot render page.</div>;
    }

    // --- Render the main page component with fetched data ---
    return (
        <ProductAccessoryPage
            user={pageData.user}
            productsData={pageData.productsData}
            filters={pageData.filters}
        />
    );
};

export default ProductAccessoryPageWrapper;