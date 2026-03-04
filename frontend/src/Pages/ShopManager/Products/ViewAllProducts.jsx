import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../utils/axios";
import {
  Package,
  Search,
  Filter,
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";

const ViewAllProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const PRODUCTS_PER_PAGE = 12;
  const [page, setPage] = useState(1);

  const loadAllProducts = async (category = "all") => {
    try {
      setLoading(true);
      const url =
        category === "all"
          ? "/vendors/products/all-sorted"
          : `/vendors/products/all-sorted?category=${category}`;

      const res = await axiosInstance.get(url);
      if (res.data.success) {
        console.log("Products data:", res.data.products);
        console.log(
          "First product price:",
          res.data.products[0]?.price,
          "regular:",
          res.data.products[0]?.regular_price,
          "sale:",
          res.data.products[0]?.sale_price,
        );
        setProducts(res.data.products || []);
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllProducts(selectedCategory);
  }, [selectedCategory]);

  const filtered = products.filter((p) => {
    const name = p.product_name?.toLowerCase() || "";
    const term = search.toLowerCase();
    return name.includes(term);
  });

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE,
  );

  const totalSold = filtered.reduce((sum, p) => sum + (p.totalSold || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/shop/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all duration-300 text-gray-700 hover:text-yellow-600"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-500 mt-1">Sorted by sales performance</p>
        </div>

        <div className="w-32"></div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-yellow-50 rounded-xl p-6 shadow-lg border border-yellow-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm uppercase tracking-wider">
                Total Products
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {filtered.length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Package className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-6 shadow-lg border border-green-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm uppercase tracking-wider">
                Total Units Sold
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {totalSold}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 shadow-lg border border-purple-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm uppercase tracking-wider">
                Category
              </h3>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {selectedCategory === "all"
                  ? "All Categories"
                  : selectedCategory}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Filter className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white text-gray-700 font-medium transition-all duration-300 min-w-[200px] cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Showing {(page - 1) * PRODUCTS_PER_PAGE + 1}-
            {Math.min(page * PRODUCTS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginated.map((product, index) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-yellow-400"
            >
              {/* Rank Badge */}
              <div className="relative">
                <div className="absolute top-3 left-3 z-10 h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg">
                  #{(page - 1) * PRODUCTS_PER_PAGE + index + 1}
                </div>

                {/* Product Image */}
                <div className="h-48 bg-gray-100 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.product_name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="text-gray-300" size={64} />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                  {product.product_name}
                </h3>

                <div className="mb-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {product.category}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Price:</span>
                    <span className="font-bold text-gray-800">
                      ₹
                      {(
                        product.sale_price ||
                        product.regular_price ||
                        product.price ||
                        0
                      ).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Total Sold:</span>
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                      {product.totalSold || 0} units
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Stock:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.stock > 5
                          ? "bg-green-100 text-green-800"
                          : product.stock > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock || 0}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/shop/products/edit/${product.id}`)}
                  className="mt-4 w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  View / Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            {search
              ? `No products match "${search}"`
              : "You haven't added any products yet."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg transition ${
                page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= page - 1 && pageNum <= page + 1)
              ) {
                return (
                  <button
                    key={i}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 rounded-lg transition ${
                      page === pageNum
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === page - 2 || pageNum === page + 2) {
                return (
                  <span key={i} className="px-2 py-2 text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg transition ${
                page === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllProducts;
