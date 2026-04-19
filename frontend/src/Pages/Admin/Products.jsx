import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";
import "./admin-styles.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [productsWithRevenue, setProductsWithRevenue] = useState([]);
  const [stats, setStats] = useState({});
  const [topOrderedProducts, setTopOrderedProducts] = useState([]);   // ← NEW
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const PRODUCTS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  // Fetch Product List
  const loadProducts = async () => {
    try {
      const res = await axiosInstance.get("/admin/products");
      if (res.data.success) setProducts(res.data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch Stats
  const loadStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/products/stats");
      if (res.data.success) setStats(res.data.stats || {});
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // NEW: Fetch Top 3 Highest Ordered Products (by quantity)
  const loadTopOrderedProducts = async () => {
    try {
      const res = await axiosInstance.get("/admin/products/top-ordered");
      if (res.data.success) {
        setTopOrderedProducts(res.data.topOrderedProducts || []);
      }
    } catch (err) {
      console.error("Error loading top ordered products:", err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await axiosInstance.delete(`/admin/products/${id}`);
      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        loadStats();           // refresh stats
        loadTopOrderedProducts(); // refresh top 3
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Fetch products with revenue and orders data
  const loadProductsWithRevenue = async () => {
    try {
      const res = await axiosInstance.get("/admin/products/with-revenue");
      if (res.data.success) setProductsWithRevenue(res.data.products || []);
    } catch (err) {
      console.error("Error loading products with revenue:", err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([loadProducts(), loadStats(), loadTopOrderedProducts(), loadProductsWithRevenue()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Data source & filtering & sorting
  const tableData = productsWithRevenue.length > 0 ? productsWithRevenue : products;

  const filtered = tableData.filter((p) => {
    const name = p.product_name?.toLowerCase() || "";
    const term = search.toLowerCase();
    return name.includes(term) || p.id?.toString().includes(term);
  });

  const sortedProducts = [...filtered].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.added_date) - new Date(a.added_date);
    }
    if (sortBy === "revenue-desc") {
      return (b.revenue || 0) - (a.revenue || 0);
    }
    if (sortBy === "revenue-asc") {
      return (a.revenue || 0) - (b.revenue || 0);
    }
    if (sortBy === "orders-desc") {
      return (b.totalOrders || 0) - (a.totalOrders || 0);
    }
    if (sortBy === "orders-asc") {
      return (a.totalOrders || 0) - (b.totalOrders || 0);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const paginated = sortedProducts.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  const columns = [
    {
      label: "Product",
      key: "product_name",
      render: (name, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold mr-3">
            {name?.charAt(0).toUpperCase() || 'P'}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{name || 'N/A'}</div>
            <div className="text-xs text-gray-500">
              ID: {row.id ? `#${row.id}` : '#N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Category",
      key: "category",
      render: (category) => (
        <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 rounded-full text-sm font-medium">
          {category || 'Uncategorized'}
        </span>
      ),
    },
    {
      label: "Price",
      key: "price",
      render: (price) => (
        <div className="text-center">
          <div className="font-bold text-gray-800 text-lg">₹{price?.toFixed(2) || '0.00'}</div>
        </div>
      ),
    },
    {
      label: "Stock",
      key: "stock",
      render: (stock) => {
        let className = "", textColor = "";
        if (stock > 5) { className = "bg-green-100 border-green-200"; textColor = "text-green-800"; }
        else if (stock > 0) { className = "bg-yellow-100 border-yellow-200"; textColor = "text-yellow-800"; }
        else { className = "bg-red-100 border-red-200"; textColor = "text-red-800"; }

        return (
          <div className="text-center">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${className} ${textColor}`}>
              {stock || 0}
            </span>
          </div>
        );
      },
    },
    {
      label: "Revenue",
      key: "revenue",
      render: (revenue) => (
        <div className="text-gray-800 font-medium">
          ₹{(revenue || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      label: "Orders",
      key: "totalOrders",
      render: (totalOrders) => (
        <div className="text-center">
          <span className="px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-sm font-semibold">
            {totalOrders || 0}
          </span>
        </div>
      ),
    },
    {
      label: "Added",
      key: "added_date",
      render: (date) => (
        <div className="text-center">
          <div className="font-semibold text-gray-800">
            {date ? new Date(date).toLocaleDateString() : "N/A"}
          </div>
        </div>
      ),
    },
    {
      label: "Actions",
      key: "action",
      render: (_, row) => (
        <div className="flex gap-3">
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all duration-300"
            onClick={() => (window.location.href = `/admin/products/${row.id}`)}
          >
            View
          </Button>

          <Button
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all duration-300"
            onClick={() => deleteProduct(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen admin-shell">
      <Sidebar />

      <div className="ml-64 w-full admin-content">
        <Header title="Products Management" />

        <div className="p-6">
          {/* Stats Cards - your original */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Products</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                  📦
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">In Stock</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.inStock ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-orange-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Low Stock</h3>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{stats.lowStock ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-xl">
                  ⚠️
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-red-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Out of Stock</h3>
                  <p className="text-3xl font-bold text-red-600 mt-2">{stats.outOfStock ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600 text-xl">
                  ❌
                </div>
              </div>
            </div>
          </div>

          {/* ====================== TOP 3 HIGHEST ORDERED PRODUCTS ====================== */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Top Ordered Products</h2>
            <p className="text-gray-600 mb-6">Highest quantity sold (All time)</p>

            {topOrderedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topOrderedProducts.map((product, index) => (
                  <div
                    key={product._id || index}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-4xl font-bold text-yellow-600">#{index + 1}</div>
                        <h3 className="text-xl font-bold text-gray-800 mt-2 line-clamp-2">
                          {product.product_name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{product.category || "—"}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          {product.totalOrdered} units
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Ordered</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-gray-200">
                <div className="text-gray-500 text-lg">No order data available yet.</div>
              </div>
            )}
          </div>
          {/* ====================== END TOP 3 ====================== */}

          {/* Search Bar + Sort Filter */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Product List</h2>
                <p className="text-gray-600 mt-1">Manage all platform products</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-80 md:w-96">
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white text-gray-700 font-medium transition-all duration-300 min-w-[220px] cursor-pointer hover:border-yellow-400 shadow-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="revenue-desc">Revenue: High to Low</option>
                  <option value="revenue-asc">Revenue: Low to High</option>
                  <option value="orders-desc">Orders: High to Low</option>
                  <option value="orders-asc">Orders: Low to High</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-4 flex items-center gap-3">
              Showing {sortedProducts.length} of {tableData.length} products
              {search && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                  Searching: "{search}"
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Loader />
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="p-6">
                  <Table columns={columns} data={paginated} />
                </div>

                {/* No results message - your original */}
                {sortedProducts.length === 0 && search && (
                  <div className="p-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
                    <p className="text-gray-600">No products match your search term "{search}"</p>
                    <button
                      onClick={() => {
                        setSearch('');
                        setPage(1);
                      }}
                      className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      Clear Search
                    </button>
                  </div>
                )}

                {sortedProducts.length === 0 && !search && (
                  <div className="p-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No products available</h3>
                    <p className="text-gray-600">There are no products in the system yet.</p>
                  </div>
                )}
              </div>

              {/* Pagination - your original */}
              {totalPages > 1 && (
                <div className="bg-white rounded-2xl shadow-lg p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-lg transition ${page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
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
                            className={`px-4 py-2 rounded-lg transition ${page === pageNum
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === page - 2 ||
                        pageNum === page + 2
                      ) {
                        return <span key={i} className="px-2 py-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`px-4 py-2 rounded-lg transition ${page === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
