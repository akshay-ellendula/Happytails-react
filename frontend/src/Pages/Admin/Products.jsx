import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const PRODUCTS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  // Fetch Product List
  const loadProducts = async () => {
    try {
      const res = await axiosInstance.get("/admin/products");
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch Stats
  const loadStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/products/stats");
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await axiosInstance.delete(`/admin/product/${id}`);
      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        loadStats();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([loadProducts(), loadStats()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filtered = products.filter((p) => {
    const name = p.product_name?.toLowerCase() || "";
    const term = search.toLowerCase();
    return name.includes(term) || p._id?.toString().includes(term);
  });

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE
  );

  const columns = [
    {
      label: "ID",
      key: "_id",
      render: (id) => `#${id}`,
    },
    { label: "Product Name", key: "product_name" },
    { label: "Category", key: "category" },
    {
      label: "Price",
      key: "price",
      render: (price) => `₹${price?.toFixed(2)}`,
    },
    {
      label: "Stock",
      key: "stock",
      render: (stock) => {
        let className =
          stock > 5
            ? "bg-green-100 text-green-600"
            : stock > 0
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-600";

        return (
          <span className={`px-3 py-1 rounded-md text-sm font-semibold ${className}`}>
            {stock}
          </span>
        );
      },
    },
    {
      label: "Added",
      key: "added_date",
      render: (date) =>
        date ? new Date(date).toLocaleDateString() : "N/A",
    },
    {
      label: "Actions",
      key: "action",
      render: (_, row) => (
        <div className="flex gap-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
            onClick={() => (window.location.href = `/admin/products/${row._id}`)}
          >
            View
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
            onClick={() => deleteProduct(row._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="ml-64 w-full">
        <Header title="Products" />

        <div className="p-6">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Products</h3>
              <p className="text-2xl font-semibold">{stats.total ?? 0}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">In Stock</h3>
              <p className="text-2xl font-semibold">{stats.inStock ?? 0}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Low Stock</h3>
              <p className="text-2xl font-semibold">{stats.lowStock ?? 0}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Out of Stock</h3>
              <p className="text-2xl font-semibold">{stats.outOfStock ?? 0}</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex">
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="flex-1 border px-3 py-2 rounded-md"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Table */}
          {loading ? (
            <Loader />
          ) : (
            <Table columns={columns} data={paginated} />
          )}

          {/* Pagination */}
          <div className="flex justify-end mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 border rounded-md ${page === i + 1
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white border-gray-300"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
