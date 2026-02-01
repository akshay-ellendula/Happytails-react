// src/Pages/ShopManager/Orders/OrderList.jsx
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    axiosInstance
      .get(`/vendors/orders?status=${filter}`)
      .then((res) => {
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      })
      .catch(() => toast.error("Failed to load orders"));
  }, [filter]);

  const updateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;

    try {
      const res = await axiosInstance.put(`/vendors/orders/${orderId}/status`, {
        status: newStatus,
      });
      // Merge the updated fields into the existing order to preserve id/customer
      setOrders(
        orders.map((o) => {
          if (o.id !== orderId) return o;
          const updated = {
            ...o,
            status: res.data.order?.status || o.status,
            timeline: res.data.order?.timeline || o.timeline,
            total: res.data.order?.total ?? o.total,
            order_date: res.data.order?.order_date || o.order_date,
            // keep original id, order_id and customer fields intact
            id: o.id,
            order_id: o.order_id || o.id,
            customer: o.customer || res.data.order?.customer,
            customer_name: o.customer_name || res.data.order?.customer_name,
          };
          return updated;
        })
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
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-8 flex-wrap">
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
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              filter === (s === "all" ? "all" : s)
                ? "bg-[#fbff90] text-black shadow-lg"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {s === "all" ? "All Orders" : s}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                Order ID
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                Customer
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                Total
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-16 text-gray-500 text-lg"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const allowedStatuses = getAllowedNextStatuses(order.status);

                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-5 font-medium">
                      #
                      {order.id || order.order_id
                        ? (order.id || order.order_id)
                            .toString()
                            .slice(-6)
                            .toUpperCase()
                        : "-"}
                    </td>
                    <td className="px-6 py-5">
                      {order.customer?.name || "Guest"}
                    </td>
                    <td className="px-6 py-5 font-semibold">
                      ₹{Number(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-5">
                      {new Date(order.order_date).toLocaleDateString("en-IN")}
                    </td>

                    {/* Status + Timeline Count */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-4 py-2 rounded-full text-xs font-bold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        {order.timeline?.length > 1 && (
                          <span className="text-xs text-gray-500 font-medium">
                            ({order.timeline.length} updates)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {/* Status Change Buttons */}
                        {allowedStatuses.length > 0 && (
                          <div className="flex gap-2">
                            {allowedStatuses.map((s) => {
                              const statusStyles = {
                                Pending: "bg-yellow-500 hover:bg-yellow-600",
                                Confirmed: "bg-purple-500 hover:bg-purple-600",
                                Shipped: "bg-blue-500 hover:bg-blue-600",
                                "Out for Delivery":
                                  "bg-indigo-500 hover:bg-indigo-600",
                                Delivered: "bg-green-500 hover:bg-green-600",
                                Cancelled: "bg-red-500 hover:bg-red-600",
                              };

                              return (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(order.id, s)}
                                  className={`px-3 py-1.5 text-white text-xs font-semibold rounded-lg ${statusStyles[s]} transition-all shadow-sm hover:shadow-md`}
                                  title={`Mark as ${s}`}
                                >
                                  {s === "Confirmed"
                                    ? "✓"
                                    : s === "Shipped"
                                    ? "🚚"
                                    : s === "Delivered"
                                    ? "✅"
                                    : s === "Cancelled"
                                    ? "✕"
                                    : s.charAt(0)}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Delete Button - Always visible */}
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm hover:underline"
                          title="Delete Order"
                        >
                          🗑️
                        </button>

                        {/* View Button */}
                        <Link
                          to={`/shop/orders/${order.id}`}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-all"
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
  );
};

export default OrderList;
