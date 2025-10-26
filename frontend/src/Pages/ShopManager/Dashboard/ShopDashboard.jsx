import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { Link } from "react-router-dom";
import { ShoppingBag, Users, DollarSign, Package } from "lucide-react";

const ShopDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/vendors/dashboard").then((res) => {
      if (res.data.success) setStats(res.data.stats);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Vendor Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">₹{stats?.totalRevenue || "0.00"}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            <span className="text-green-500 font-medium">+{stats?.revenueChange || 0}%</span> from last month
          </div>
        </div>

        {/* Products Sold */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Products Sold</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats?.productsSold || 0}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full text-blue-600">
              <Package size={24} />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            <span className="text-blue-500 font-medium">+{stats?.productsSoldChange || 0}%</span> from last month
          </div>
        </div>

        {/* New Orders */}
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">New Orders</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats?.newOrders || 0}</h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-full text-orange-600">
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="text-sm text-gray-500">Awaiting processing</div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <Link to="/shop/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Order ID</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Customer</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Product</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Date</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Amount</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recentOrders?.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-800 font-medium">#ORD-{order.id.slice(-6).toUpperCase()}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{order.user_name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{order.product_name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(order.order_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-800">₹{order.total_amount.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "Confirmed"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {order.status === "Confirmed" ? "Confirmed" : order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colspan="6" className="py-8 text-center text-gray-500">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link
          to="/shop/products/add"
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-md"
        >
          Add New Product
        </Link>
        <Link
          to="/shop/analytics"
          className="bg-white text-gray-800 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          View Sales Report
        </Link>
      </div>
    </div>
  );
};

export default ShopDashboard;
