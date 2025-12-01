import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const VENDORS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  // Fetch vendor list
  const loadVendors = async () => {
    try {
      const res = await axiosInstance.get("/admin/vendors");
      if (res.data.success) setVendors(res.data.vendors);
    } catch (err) {
      console.error("Error loading vendors:", err.response?.data || err.message);
    }
  };

  // Fetch stats
  const loadStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/vendors/stats");
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error("Error loading vendor stats:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([loadVendors(), loadStats()]);
      // await loadVendors();
      // await loadStats();
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filtering
  const filtered = vendors.filter((v) => {
    const s = search.toLowerCase();
    return (
      v.name?.toLowerCase().includes(s) ||
      v.email?.toLowerCase().includes(s) ||
      v.store_name?.toLowerCase().includes(s)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / VENDORS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * VENDORS_PER_PAGE,
    page * VENDORS_PER_PAGE
  );

  const columns = [
    {
      label: "ID",
      key: "id",
      render: (id) => `#${id}`,
    },
    { label: "Name", key: "name" },
    { label: "Shop Name", key: "store_name" },
    { label: "Email", key: "email" },
    {
      label: "Joined Date",
      key: "joined_date",
      render: (date) =>
        date ? new Date(date).toLocaleDateString() : "N/A",
    },
    {
      label: "Actions",
      key: "action",
      render: (_, row) => (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
          onClick={() => (window.location.href = `/admin/vendors/${row.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="ml-64 w-full">
        <Header title="Shop Manager Management" />

        <div className="p-6">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Managers</h3>
              <p className="text-2xl font-semibold">{stats.total ?? 0}</p>
              <p className="text-green-600 text-sm">
                {stats.totalGrowthPercent >= 0 ? "+" : ""}
                {stats.totalGrowthPercent?.toFixed(0)}% from last month
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Revenue</h3>
              <p className="text-2xl font-semibold">
                ₹{stats.totalRevenue?.toFixed(2) ?? "0.00"}
              </p>
              <p className="text-green-600 text-sm">
                {stats.revenueGrowthPercent >= 0 ? "+" : ""}
                {stats.revenueGrowthPercent?.toFixed(0)}% from last month
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Orders</h3>
              <p className="text-2xl font-semibold">{stats.totalOrders ?? 0}</p>
              <p className="text-green-600 text-sm">
                {stats.ordersGrowthPercent >= 0 ? "+" : ""}
                {stats.ordersGrowthPercent?.toFixed(0)}% from last month
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Today's Orders</h3>
              <p className="text-2xl font-semibold">{stats.todaysOrders ?? 0}</p>
              <p className="text-green-600 text-sm">
                {stats.todaysOrdersChange >= 0 ? "+" : ""}
                {stats.todaysOrdersChange?.toFixed(0)}% from yesterday
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
            <input
              type="text"
              placeholder="Search managers by name, email, or shop..."
              className="flex-1 border px-3 py-2 rounded-md"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              Filter
            </Button>
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
