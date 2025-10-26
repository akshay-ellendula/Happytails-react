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
      // Update the order in list with new data (including timeline)
      setOrders(orders.map((o) => (o.id === orderId ? res.data.order : o)));
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
      case "Confirmed":
        return "bg-purple-100 text-purple-800";
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
    if (current === "Confirmed") return ["Shipped", "Delivered", "Cancelled"];
    if (current === "Shipped") return ["Delivered", "Cancelled"];
    if (current === "Delivered") return ["Cancelled"];
    return [];
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Orders</h1>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {["all", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((s) => (
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
                      #{order.order_id || order.id.slice(-6).toUpperCase()}
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
                        {/* Status Dropdown */}
                        {allowedStatuses.length > 0 && (
                          <select
                            onChange={(e) =>
                              updateStatus(order.id, e.target.value)
                            }
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Change Status
                            </option>
                            {allowedStatuses.map((s) => (
                              <option key={s} value={s}>
                                → {s}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Delete Button - Only for Confirmed */}
                        {order.status === "Confirmed" && (
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Delete
                          </button>
                        )}

                        {/* View Button */}
                        <Link
                          to={`/shop/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View →
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
