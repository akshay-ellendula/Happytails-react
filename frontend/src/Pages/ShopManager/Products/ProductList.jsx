import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Eye,
  Package,
  TrendingUp,
  ChevronDown,
  DollarSign,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "All Categories",
    sort: "newest",
  });
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [topLoading, setTopLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchTopProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get("/vendors/products", { params: filters });
      if (res.data.success) setProducts(res.data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
    setLoading(false);
  };

  const fetchTopProducts = async () => {
    setTopLoading(true);
    try {
      const res = await axiosInstance.get("/vendors/products/top3");
      console.log("Top 3 API response:", res.data); // debug
      if (res.data.success) {
        setTopProducts(res.data.topProducts || []);
      }
    } catch (err) {
      console.error("Error fetching top 3:", err);
    }
    setTopLoading(false);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: "bg-orange-100 text-orange-800",
      toys: "bg-blue-100 text-blue-800",
      grooming: "bg-purple-100 text-purple-800",
      beds: "bg-emerald-100 text-emerald-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category?.toLowerCase()] || colors.other;
  };

  const getStockBadge = (quantity) => {
    if (quantity > 15) return { text: "In Stock", color: "bg-emerald-100 text-emerald-800" };
    if (quantity > 0) return { text: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Out of Stock", color: "bg-red-100 text-red-800" };
  };

  const filteredProducts = products.filter(
    (p) =>
      search === "" ||
      p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.product_category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-500 mt-1">Manage your store's products</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Package className="text-emerald-600" size={24} />
          </div>
        </div>
      </div>

      {/* Top 3 Best Sellers – no "View Details" links */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top 3 Best Sellers</h2>
              <p className="text-sm text-gray-600">By total revenue – all time</p>
            </div>
          </div>
          <Link
            to="/shop/products"
            className="hidden sm:flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 text-sm font-medium"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {topLoading ? (
          <div className="py-16 flex justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : topProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            {topProducts.map((prod, idx) => (
              <div
                key={prod.product_id}
                className="p-5 lg:p-6 group hover:bg-gray-50/70 transition-colors relative"
              >
                {/* Rank badge */}
                <div className="absolute top-4 right-4 lg:top-5 lg:right-5 bg-gradient-to-br from-emerald-500 to-green-600 text-white text-xs lg:text-sm font-bold w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shadow-md ring-4 ring-white z-10">
                  #{idx + 1}
                </div>

                <div className="flex items-start gap-4 lg:gap-5">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.product_name}
                        className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-xl border border-gray-200 shadow-sm group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                        <Package className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>

                  {/* Content – no link */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base lg:text-lg text-gray-900 truncate mb-1.5 lg:mb-2">
                      {prod.product_name}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 lg:gap-6 text-sm mt-2 lg:mt-3">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Sold</p>
                        <p className="font-bold text-gray-800 text-base lg:text-lg">{prod.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Revenue</p>
                        <p className="font-bold text-gray-800 text-base lg:text-lg">₹{prod.revenue}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 lg:py-16 px-6 text-center text-gray-500">
            <div className="w-16 h-16 lg:w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-gray-400" size={32} />
            </div>
            <h3 className="text-base lg:text-lg font-medium text-gray-700 mb-2">No sales yet</h3>
            <p className="text-sm mb-5 lg:mb-6">
              Your top selling products will appear here once orders start coming in.
            </p>
            <Link
              to="/shop/products/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition shadow-sm"
            >
              <Plus size={18} /> Add Product
            </Link>
          </div>
        )}
      </div>

      {/* Search + Filters */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex items-center gap-3">
              <Search className="text-gray-400 ml-2" size={20} />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 rounded-lg">
                  <Filter className="text-gray-400" size={20} />
                </button>
                <div className="flex border-l border-gray-200 pl-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg ${
                      viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg ${
                      viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <select
            name="category"
            onChange={handleFilterChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="All Categories">All Categories</option>
            <option value="food">Food</option>
            <option value="toys">Toys</option>
            <option value="grooming">Grooming</option>
            <option value="beds">Beds</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            name="sort"
            onChange={handleFilterChange}
            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white min-w-[180px]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Stock Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Value</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            ₹{products.reduce((sum, p) => sum + (p.regular_price || 0) * (p.stock_quantity || 0), 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">In Stock</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {products.filter((p) => (p.stock_quantity || 0) > 15).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700 font-medium">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {products.filter((p) => (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 15).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Out of Stock</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {products.filter((p) => (p.stock_quantity || 0) === 0).length}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {filteredProducts.map((product) => {
              const stockBadge = getStockBadge(product.stock_quantity || 0);

              return (
                <div
                  key={product._id || product.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className="relative h-44 sm:h-48 bg-gray-50">
                    {product.image_data ? (
                      <img
                        src={product.image_data}
                        alt={product.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="text-gray-300" size={64} />
                      </div>
                    )}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        product.product_category
                      )}`}
                    >
                      {product.product_category || "other"}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                      {product.product_name}
                    </h3>

                    <div className="flex justify-between items-center mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="font-bold text-gray-900">
                          ₹{(product.sale_price || product.regular_price || 0).toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${stockBadge.color}`}
                      >
                        {stockBadge.text}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => navigate(`/shop/products/edit/${product._id || product.id}`)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        <Eye size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden p-8 text-center text-gray-500">
            List view not implemented in this version
          </div>
        )
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            {search ? "Try different keywords" : "Add your first product to get started"}
          </p>
          <Link
            to="/shop/products/add"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Add New Product
          </Link>
        </div>
      )}

      {/* Floating Add Button */}
      <Link
        to="/shop/products/add"
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 z-50"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
};

export default ProductList;