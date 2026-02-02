import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";
import "./admin-styles.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch order stats
  const loadStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/orders/stats");
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

  const columns = [
    {
      label: "Order",
      key: "orderId",
      render: (val, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold mr-3">
            #{val?.toString().slice(-4) || '0000'}
          </div>
          <div>
            <div className="font-semibold text-gray-800">#{val || 'N/A'}</div>
            <div className="text-xs text-gray-500">
              {row.customerName || 'Unknown Customer'}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Customer",
      key: "customerName",
      render: (name) => (
        <div className="text-gray-800">{name || 'N/A'}</div>
      ),
    },
    {
      label: "Date & Time",
      key: "orderDate",
      render: (val) => (
        <div className="text-center">
          <div className="font-semibold text-gray-800">
            {val ? new Date(val).toLocaleDateString() : "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            {val ? new Date(val).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
          </div>
        </div>
      ),
    },
    {
      label: "Amount",
      key: "totalAmount",
      render: (val) => (
        <div className="text-center">
          <div className="font-bold text-gray-800 text-lg">₹{val?.toFixed(2) || '0.00'}</div>
          <div className="text-xs text-gray-500">incl. 10% tax</div>
        </div>
      ),
    },
    {
      label: "Status",
      key: "status",
      render: (val) => {
        const statusConfig = {
          Pending: {
            color: "from-yellow-100 to-yellow-50",
            text: "text-yellow-800",
            border: "border-yellow-200",
            icon: "⏳"
          },
          Confirmed: {
            color: "from-blue-100 to-blue-50",
            text: "text-blue-800",
            border: "border-blue-200",
            icon: "✅"
          },
          Shipped: {
            color: "from-cyan-100 to-cyan-50",
            text: "text-cyan-800",
            border: "border-cyan-200",
            icon: "🚚"
          },
          Delivered: {
            color: "from-green-100 to-green-50",
            text: "text-green-800",
            border: "border-green-200",
            icon: "📦"
          },
          Cancelled: {
            color: "from-red-100 to-red-50",
            text: "text-red-800",
            border: "border-red-200",
            icon: "❌"
          },
        };

        const config = statusConfig[val] || {
          color: "from-gray-100 to-gray-50",
          text: "text-gray-800",
          border: "border-gray-200",
          icon: "❓"
        };

        return (
          <div className="flex items-center">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r ${config.color} ${config.text} border ${config.border}`}>
              <span className="mr-2">{config.icon}</span>
              {val || 'Unknown'}
            </span>
          </div>
        );
      },
    },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <Button
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all duration-300"
          onClick={() =>
            (window.location.href = `/admin/orders/${row.orderId}`)
          }
        >
          View Details
        </Button>
      ),
    },
  ];

  // Calculate revenue stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Sidebar />

      <div className="ml-64 w-full">
        <Header title="Order Management" />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Orders</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalOrders?.toLocaleString() ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                  📊
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Revenue</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  💰
                </div>
              </div>
              <div className="text-sm text-gray-500">incl. 10% tax</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Avg Order Value</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">₹{averageOrderValue.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                  📈
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Today's Orders</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.dailyOrders ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  ⚡
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-600 text-sm font-medium">Monthly Orders</h3>
                  <p className="text-2xl font-bold mt-2">{stats.monthlyOrders ?? 0}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-yellow-200 flex items-center justify-center text-yellow-700">
                  📅
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-600 text-sm font-medium">Weekly Orders</h3>
                  <p className="text-2xl font-bold mt-2">{stats.weeklyOrders ?? 0}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-200 flex items-center justify-center text-blue-700">
                  📆
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Order List</h2>
                <p className="text-gray-600">Manage all platform orders</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Order ID or customer name..."
                  className="w-96 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Showing {filtered.length} of {orders.length} orders
                {search && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Searching for: "{search}"
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-gray-600">Delivered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-gray-600">Pending</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-gray-600">Cancelled</span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Loader />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <Table columns={columns} data={filtered} />
              </div>
              
              {/* No results message */}
              {filtered.length === 0 && search && (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders found</h3>
                  <p className="text-gray-600">No orders match your search term "{search}"</p>
                  <button
                    onClick={() => setSearch('')}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                  >
                    Clear Search
                  </button>
                </div>
              )}
              
              {filtered.length === 0 && !search && (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders available</h3>
                  <p className="text-gray-600">There are no orders in the system yet.</p>
                </div>
              )}

              {/* Order Summary Footer */}
              {filtered.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-800">Order Summary</h4>
                      <p className="text-sm text-gray-600">Showing all {filtered.length} orders</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          ₹{filtered.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {filtered.filter(o => o.status === 'Delivered').length}
                        </div>
                        <div className="text-sm text-gray-500">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {filtered.filter(o => o.status === 'Pending').length}
                        </div>
                        <div className="text-sm text-gray-500">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}