import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronDown,
  Download,
} from "lucide-react";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/vendors/orders?status=${filter}`)
      .then((res) => {
        if (res.data.success) {
          setOrders(res.data.orders);
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load orders");
        setLoading(false);
      });
  }, [filter]);

  const updateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;

    try {
      const res = await axiosInstance.put(`/vendors/orders/${orderId}/status`, {
        status: newStatus,
      });
      setOrders(
        orders.map((o) => {
          if (o.id !== orderId) return o;
          const updated = {
            ...o,
            status: res.data.order?.status || o.status,
            timeline: res.data.order?.timeline || o.timeline,
            total: res.data.order?.total ?? o.total,
            order_date: res.data.order?.order_date || o.order_date,
            id: o.id,
            order_id: o.order_id || o.id,
            customer: o.customer || res.data.order?.customer,
            customer_name: o.customer_name || res.data.order?.customer_name,
          };
          return updated;
        }),
      );
      toast.success("Status updated!");
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order permanently?")) return;
    try {
      await axiosInstance.delete(`/vendors/orders/${orderId}`);
      setOrders(orders.filter((o) => o.id !== orderId));
      toast.success("Order deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-purple-100 text-purple-800";
      case "Out for Delivery":
        return "bg-indigo-100 text-indigo-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return "⏳";
      case "Confirmed":
        return "✓";
      case "Shipped":
        return "🚚";
      case "Out for Delivery":
        return "📦";
      case "Delivered":
        return "✅";
      case "Cancelled":
        return "✕";
      default:
        return "";
    }
  };

  const getAllowedNextStatuses = (current) => {
    if (current === "Pending") return ["Confirmed", "Cancelled"];
    if (current === "Confirmed") return ["Shipped", "Cancelled"];
    if (current === "Shipped")
      return ["Out for Delivery", "Delivered", "Cancelled"];
    if (current === "Out for Delivery") return ["Delivered", "Cancelled"];
    if (current === "Delivered") return [];
    return [];
  };

  const filteredOrders = orders.filter(
    (order) =>
      search === "" ||
      (order.id && order.id.toString().includes(search)) ||
      (order.customer?.name &&
        order.customer.name.toLowerCase().includes(search.toLowerCase())) ||
      (order.customer_name &&
        order.customer_name.toLowerCase().includes(search.toLowerCase())),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and track all customer orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Package className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm border border-gray-200 p-3 flex items-center gap-3">
            <Search className="text-gray-400 ml-2" size={20} />
            <input
              type="text"
              placeholder="Search orders by ID or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
            <button className="p-2 bg-gray-100 rounded-lg">
              <Filter className="text-gray-400" size={20} />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download size={18} />
            <span className="font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 items-center overflow-x-auto pb-2">
        {[
          "all",
          "Pending",
          "Confirmed",
          "Shipped",
          "Out for Delivery",
          "Delivered",
          "Cancelled",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s === "all" ? "all" : s)}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              filter === (s === "all" ? "all" : s)
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {s === "all" ? "All Orders" : s}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-2">
                {orders.filter((o) => o.status === "Pending").length}
              </p>
            </div>
            <Package className="text-yellow-500" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Processing</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {
                  orders.filter((o) =>
                    ["Confirmed", "Shipped"].includes(o.status),
                  ).length
                }
              </p>
            </div>
            <Truck className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Delivered</p>
              <p className="text-2xl font-bold text-emerald-900 mt-2">
                {orders.filter((o) => o.status === "Delivered").length}
              </p>
            </div>
            <CheckCircle className="text-emerald-500" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-red-900 mt-2">
                {orders.filter((o) => o.status === "Cancelled").length}
              </p>
            </div>
            <XCircle className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Order List</h2>
            <span className="text-sm text-gray-500">
              {filteredOrders.length} orders
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Order ID
                </th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Customer
                </th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Total
                </th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Date
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="text-center">
                      <Package className="mx-auto text-gray-300" size={48} />
                      <p className="text-gray-500 mt-4">No orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const allowedStatuses = getAllowedNextStatuses(order.status);

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          #
                          {order.id || order.order_id
                            ? (order.id || order.order_id)
                                .toString()
                                .slice(-6)
                                .toUpperCase()
                            : "-"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {(order.customer?.name || "G")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <span className="text-gray-700">
                            {order.customer?.name || "Guest"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-gray-400" />
                          <span className="font-bold text-gray-900">
                            ₹{Number(order.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-gray-600">
                            {new Date(order.order_date).toLocaleDateString(
                              "en-IN",
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {getStatusIcon(order.status)} {order.status}
                          </span>
                          {order.timeline?.length > 1 && (
                            <span className="text-xs text-gray-500 font-medium">
                              ({order.timeline.length} updates)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {/* Status Change Buttons */}
                          {allowedStatuses.length > 0 && (
                            <div className="flex gap-2">
                              {allowedStatuses.map((s) => {
                                const statusStyles = {
                                  Pending: "bg-yellow-500",
                                  Confirmed: "bg-purple-500",
                                  Shipped: "bg-blue-500",
                                  "Out for Delivery": "bg-indigo-500",
                                  Delivered: "bg-emerald-500",
                                  Cancelled: "bg-red-500",
                                };

                                return (
                                  <button
                                    key={s}
                                    onClick={() => updateStatus(order.id, s)}
                                    className={`w-8 h-8 flex items-center justify-center text-white text-xs font-bold rounded-lg ${statusStyles[s]} hover:opacity-90 transition-opacity`}
                                    title={`Mark as ${s}`}
                                  >
                                    {getStatusIcon(s)}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <XCircle size={18} />
                          </button>

                          {/* View Button */}
                          <Link
                            to={`/shop/orders/${order.id}`}
                            className="px-3 py-1.5 bg-gray-900 text-white hover:bg-gray-800 font-medium text-sm rounded-lg transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
          <h4 className="font-bold text-gray-900 mb-2">Order Statistics</h4>
          <p className="text-sm text-gray-600">
            {orders.filter((o) => o.status === "Pending").length} pending orders
            need attention
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
          <h4 className="font-bold text-gray-900 mb-2">Revenue Today</h4>
          <p className="text-sm text-gray-600">
            ₹
            {orders
              .filter(
                (o) =>
                  new Date(o.order_date).toDateString() ===
                  new Date().toDateString(),
              )
              .reduce((sum, o) => sum + Number(o.total || 0), 0)
              .toFixed(2)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
          <h4 className="font-bold text-gray-900 mb-2">Average Order Value</h4>
          <p className="text-sm text-gray-600">
            ₹
            {(
              orders.reduce((sum, o) => sum + Number(o.total || 0), 0) /
              Math.max(orders.length, 1)
            ).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
