import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { Link, useNavigate } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "All Categories",
    sort: "newest",
  });
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get("/vendors/products", { params: filters }).then((res) => {
      if (res.data.success) setProducts(res.data.products);
    });
  }, [filters]);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl">Products</h1>
        <div className="flex gap-2">
          <select
            name="category"
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="All Categories">All Categories</option>
            <option value="food">Food</option>
            <option value="toys">Toys</option>
            <option value="grooming">Grooming</option>
            <option value="beds">Beds</option>
          </select>
          <select
            name="sort"
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>
      <hr className="border-gray-300 mb-4" />

      <div className="flex gap-5 flex-wrap">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md p-4 w-64 text-center relative"
          >
            <button
              onClick={() => navigate(`/shop/products/edit/${product.id}`)}
              className="absolute top-2 right-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✎
            </button>
            <img
              src={product.image_data}
              alt={product.product_name}
              className="w-56 h-40 object-cover mb-2 rounded-xl mx-auto"
            />
            <h3 className="font-bold my-1">{product.product_name}</h3>
            <p className="text-sm text-gray-500">{product.product_category}</p>
            <p className="font-bold text-blue-600">
              ₹{(product.sale_price || product.regular_price).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">
              Stock: {product.stock_quantity}
            </p>
          </div>
        ))}
      </div>
      <Link
        to="/shop/products/add"
        className="fixed bottom-12 right-5 bg-blue-800 text-white w-12 h-12 rounded-full text-2xl flex justify-center items-center shadow-lg hover:bg-blue-900"
      >
        +
      </Link>
    </div>
  );
};

export default ProductList;
