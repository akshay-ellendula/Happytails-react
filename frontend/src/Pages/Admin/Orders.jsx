import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch order stats
  const loadStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/order-stats");
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error("Error fetching order stats:", err);
    }
  };

  // Fetch orders
  const loadOrders = async () => {
    try {
      const res = await axiosInstance.get("/admin/orders");
      if (res.data.success) setOrders(res.data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadStats(), loadOrders()]);
      setLoading(false);
    };
    init();
  }, []);

  const filtered = orders.filter((order) => {
    const id = order.orderId?.toString().toLowerCase() || "";
    const name = order.customerName?.toLowerCase() || "";
    const s = search.toLowerCase();
    return id.includes(s) || name.includes(s);
  });

  const statusColor = {
    Pending: "bg-yellow-500",
    Confirmed: "bg-blue-500",
    Shipped: "bg-cyan-600",
    Delivered: "bg-green-600",
    Cancelled: "bg-red-600",
  };

  const columns = [
    {
      label: "Order ID",
      key: "orderId",
      render: (val) => `#ORD-${val}`,
    },
    { label: "Customer", key: "customerName" },
    {
      label: "Date",
      key: "orderDate",
      render: (val) => new Date(val).toLocaleDateString(),
    },
    {
      label: "Amount",
      key: "totalAmount",
      render: (val) => `₹${val.toFixed(2)}`,
    },
    {
      label: "Status",
      key: "status",
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-white text-sm ${
            statusColor[val] || "bg-gray-500"
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
          onClick={() =>
            (window.location.href = `/admin/orders/${row.orderId}`)
          }
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
        <Header title="Order Management" />

        <div className="p-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-gray-500 text-sm">Total Orders</h3>
              <p className="text-2xl font-bold">
                {stats.totalOrders ?? 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-gray-500 text-sm">Monthly</h3>
              <p className="text-2xl font-bold">
                {stats.monthlyOrders ?? 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-gray-500 text-sm">Weekly</h3>
              <p className="text-2xl font-bold">
                {stats.weeklyOrders ?? 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-gray-500 text-sm">Today</h3>
              <p className="text-2xl font-bold">{stats.dailyOrders ?? 0}</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <input
              type="text"
              placeholder="Search by Order ID or customer name..."
              className="w-full border px-3 py-2 rounded-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Orders Table */}
          {loading ? (
            <Loader />
          ) : (
            <Table columns={columns} data={filtered} />
          )}
        </div>
      </div>
    </div>
  );
}
