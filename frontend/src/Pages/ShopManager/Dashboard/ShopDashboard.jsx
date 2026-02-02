import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { Link } from "react-router-dom";
import { ShoppingBag, Users, DollarSign, Package, TrendingUp, Calendar } from "lucide-react";

const ShopDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/vendors/dashboard")
      .then((res) => {
        console.log('Dashboard response:', res.data);
        if (res.data.success) {
          setStats(res.data.stats);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Dashboard fetch error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Dashboard...</p>
      </div>
    </div>
  );
  
  if (!stats) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No dashboard data available</h3>
        <p className="text-gray-500 mb-4">Please ensure you have orders or products.</p>
        <Link
          to="/shop/products/add"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          Add Your First Product
        </Link>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to your store management dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg border border-emerald-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">₹{stats.totalRevenue || "0.00"}</h3>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className={`font-medium ${parseFloat(stats.revenueChange || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {parseFloat(stats.revenueChange || 0) >= 0 ? '+' : ''}{stats.revenueChange || 0}%
            </span>
            from last month
            {parseFloat(stats.revenueChange || 0) >= 0 ? (
              <TrendingUp className="text-emerald-500" size={16} />
            ) : (
              <TrendingUp className="text-red-500 rotate-180" size={16} />
            )}
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(Math.abs(parseFloat(stats.revenueChange || 0)) * 3, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Products Sold */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Products Sold</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {typeof stats.productsSold === 'object' ? stats.productsSold.total : stats.productsSold || 0}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className={`font-medium ${parseFloat(stats.productsSoldChange || 0) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              {parseFloat(stats.productsSoldChange || 0) >= 0 ? '+' : ''}{stats.productsSoldChange || 0}%
            </span>
            from last month
            {parseFloat(stats.productsSoldChange || 0) >= 0 ? (
              <TrendingUp className="text-blue-500" size={16} />
            ) : (
              <TrendingUp className="text-red-500 rotate-180" size={16} />
            )}
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(Math.abs(parseFloat(stats.productsSoldChange || 0)) * 3, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* New Orders */}
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-lg border border-orange-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">New Orders</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.newOrders || 0}</h3>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <ShoppingBag className="text-orange-600" size={24} />
            </div>
          </div>
          <div className="text-sm text-gray-500">Awaiting processing</div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <span className="text-xs text-gray-500">65% processed</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <p className="text-gray-500 text-sm mt-1">Latest customer purchases</p>
          </div>
          <Link to="/shop/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-1">
            <span>View All</span>
            <TrendingUp size={16} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Order ID</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Customer</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Product</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Date</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Amount</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">
                        #ORD-{order.id.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users size={14} className="text-blue-600" />
                        </div>
                        <span className="text-gray-700">{order.user_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-400" />
                        <span className="text-gray-600">{order.product_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(order.order_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-800">₹{(order.total_amount || 0).toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          order.status === "Confirmed"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="text-center">
                      <ShoppingBag className="mx-auto text-gray-300" size={48} />
                      <p className="text-gray-500 mt-4">No recent orders found.</p>
                    </div>
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
          className="flex-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 rounded-2xl font-medium hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
        >
          <Package size={20} />
          <span>Add New Product</span>
        </Link>
        <Link
          to="/shop/analytics"
          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl font-medium hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
        >
          <TrendingUp size={20} />
          <span>View Sales Report</span>
        </Link>
      </div>


    </div>
  );
};

export default ShopDashboard;