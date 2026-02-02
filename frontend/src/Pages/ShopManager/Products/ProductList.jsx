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
  Edit,
  Trash2,
  Package,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  SortAsc,
  DollarSign,
  Hash,
  AlertCircle,
} from "lucide-react";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: "All Categories",
    sort: "newest",
  });
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get("/vendors/products", {
        params: filters,
      });
      if (res.data.success) setProducts(res.data.products);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const getCategoryColor = (category) => {
    const colors = {
      food: "bg-orange-100 text-orange-800",
      toys: "bg-blue-100 text-blue-800",
      grooming: "bg-purple-100 text-purple-800",
      beds: "bg-emerald-100 text-emerald-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.other;
  };

  const getStockBadge = (quantity) => {
    if (quantity > 15)
      return { text: "In Stock", color: "bg-emerald-100 text-emerald-800" };
    if (quantity > 0)
      return { text: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Out of Stock", color: "bg-red-100 text-red-800" };
  };

  const filteredProducts = products.filter(
    (product) =>
      search === "" ||
      product.product_name.toLowerCase().includes(search.toLowerCase()) ||
      product.product_category.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );

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
            <p className="text-2xl font-bold text-gray-900">
              {products.length}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Package className="text-emerald-600" size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-3 flex items-center gap-3">
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
                  className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <select
            name="category"
            onChange={handleFilterChange}
            className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            <option value="All Categories">All Categories</option>
            <option value="food">Food</option>
            <option value="toys">Toys</option>
            <option value="grooming">Grooming</option>
            <option value="beds">Beds</option>
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex flex-wrap gap-3">
        <select
          name="sort"
          onChange={handleFilterChange}
          className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        <div className="flex gap-2">
          <button className="px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            <SortAsc size={18} />
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Value</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                ₹
                {products
                  .reduce(
                    (sum, p) => sum + (p.regular_price * p.stock_quantity || 0),
                    0,
                  )
                  .toFixed(2)}
              </p>
            </div>
            <DollarSign className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">In Stock</p>
              <p className="text-2xl font-bold text-emerald-900 mt-2">
                {products.filter((p) => p.stock_quantity > 0).length}
              </p>
            </div>
            <Package className="text-emerald-500" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-900 mt-2">
                {
                  products.filter(
                    (p) => p.stock_quantity > 0 && p.stock_quantity <= 15,
                  ).length
                }
              </p>
            </div>
            <AlertCircle className="text-yellow-500" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900 mt-2">
                {products.filter((p) => p.stock_quantity <= 0).length}
              </p>
            </div>
            <Hash className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const stockBadge = getStockBadge(product.stock_quantity);

            return (
              <div
                key={product.id}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative">
                  <img
                    src={product.image_data}
                    alt={product.product_name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() =>
                      navigate(`/shop/products/edit/${product.id}`)
                    }
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit size={18} className="text-gray-700" />
                  </button>
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${stockBadge.color}`}
                    >
                      {stockBadge.text}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">
                        {product.product_name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(product.product_category)} mt-1 inline-block`}
                      >
                        {product.product_category}
                      </span>
                    </div>
                    {/* rating removed per request */}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        ₹
                        {(product.sale_price || product.regular_price).toFixed(
                          2,
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        Stock:{" "}
                        <span className="font-medium">
                          {product.stock_quantity}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/shop/products/edit/${product.id}`)
                        }
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/shop/products/edit/${product.id}`)
                        }
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                    Product
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                    Category
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                    Price
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                    Stock
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                    Status
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const stockBadge = getStockBadge(product.stock_quantity);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_data}
                            alt={product.product_name}
                            className="w-16 h-16 object-cover rounded-xl"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.product_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.product_type}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.product_category)}`}
                        >
                          {product.product_category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900">
                          ₹
                          {(
                            product.sale_price || product.regular_price
                          ).toFixed(2)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-700">
                          {product.stock_quantity}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${stockBadge.color}`}
                        >
                          {stockBadge.text}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/shop/products/edit/${product.id}`)
                            }
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Button */}
      <Link
        to="/shop/products/add"
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300"
      >
        <Plus size={24} />
      </Link>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 mb-6">
            {search
              ? "Try a different search term"
              : "Add your first product to get started"}
          </p>
          <Link
            to="/shop/products/add"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            <span>Add New Product</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductList;
