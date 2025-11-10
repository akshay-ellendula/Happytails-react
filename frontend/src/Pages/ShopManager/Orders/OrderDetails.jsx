// src/Pages/ShopManager/Orders/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../utils/axios";
import { Printer, Package, Truck, CheckCircle, XCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/vendors/orders/${orderId}`)
      .then((res) => {
        if (res.data.success) {
          setOrder(res.data.order);
        }
      })
      .catch(() => {
        toast.error("Failed to load order details");
      });
  }, [orderId]);

  const updateStatus = async (newStatus) => {
    if (!window.confirm(`Mark order as ${newStatus}?`)) return;

    try {
      const res = await axiosInstance.put(`/vendors/orders/${orderId}/status`, {
        status: newStatus,
      });
      setOrder(res.data.order);
      toast.success("Status updated successfully!");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteOrder = async () => {
    if (!window.confirm("Delete this order permanently? This cannot be undone.")) return;

    try {
      await axiosInstance.delete(`/vendors/orders/${orderId}`);
      toast.success("Order deleted successfully");
      navigate("/shop/orders");
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Failed to delete order");
    }
  };

  const printOrder = () => {
    window.print();
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-medium text-gray-600">Loading order...</div>
      </div>
    );
  }

  // Safe number formatting
  const fmt = (num) => Number(num || 0).toFixed(2);

  const status = order.status;
  const timeline = order.timeline || [];

  // Allow delete on all orders
  const canDelete = true;
  
  // Get allowed next statuses based on current status
  const getAllowedNextStatuses = () => {
    if (status === "Pending") return ["Confirmed", "Cancelled"];
    if (status === "Confirmed") return ["Shipped", "Delivered", "Cancelled"];
    if (status === "Shipped") return ["Delivered", "Cancelled"];
    if (status === "Delivered") return [];
    return [];
  };
  
  const allowedStatuses = getAllowedNextStatuses();

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg my-8 print:shadow-none print:max-w-full print:p-0">
      {/* Header - Back + Actions */}
      <div className="flex justify-between items-center mb-10 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="text-lg font-medium text-gray-700 hover:text-black flex items-center gap-2"
        >
          ← Back to Orders
        </button>
        <div className="flex gap-4">
          <button
            onClick={printOrder}
            className="flex items-center gap-3 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Printer size={20} />
            <span className="font-medium">Print Order</span>
          </button>
          {canDelete && (
            <button
              onClick={deleteOrder}
              className="flex items-center gap-3 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <Trash2 size={20} />
              <span className="font-medium">Delete Order</span>
            </button>
          )}
        </div>
      </div>

      {/* PERFECT TIMELINE - EXACTLY LIKE YOUR IMAGE */}
<div className="mb-12">
  <h2 className="text-2xl font-bold mb-8 text-gray-800">Order Timeline</h2>

  <div className="space-y-10">
    {/* Order Placed - Always First */}
    <div className="flex items-start gap-5">
      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-md">
        <Package size={26} className="text-white" />
      </div>
      <div className="pt-2">
        <p className="font-semibold text-gray-800">Order was placed.</p>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(order.order_date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}{" "}
          {new Date(order.order_date).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>

    {/* All Status Changes from Timeline */}
    {timeline.map((event, index) => (
      <div key={index} className="flex items-start gap-5">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
            event.status === "Shipped"
              ? "bg-blue-500"
              : event.status === "Delivered"
              ? "bg-green-500"
              : event.status === "Cancelled"
              ? "bg-red-500"
              : "bg-purple-500"
          }`}
        >
          {event.status === "Shipped" ? (
            <Truck size={26} className="text-white" />
          ) : event.status === "Delivered" ? (
            <CheckCircle size={26} className="text-white" />
          ) : event.status === "Cancelled" ? (
            <XCircle size={26} className="text-white" />
          ) : (
            <Package size={26} className="text-white" />
          )}
        </div>

        <div className="pt-2">
          <p className="font-semibold text-gray-800">
            {event.status === "Shipped" && "Your order has been shipped."}
            {event.status === "Delivered" && "Your order has been delivered."}
            {event.status === "Cancelled" && "Your order has been cancelled."}
            {event.status === "Confirmed" && "Order Confirmed by seller."}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(event.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            {new Date(event.date).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>

      {/* Update Status Section */}
      {allowedStatuses.length > 0 && (
        <div className="mb-12 print:hidden bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Update Order Status</h3>
          <p className="text-gray-600 mb-6">Current Status: <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            status === "Pending" ? "bg-yellow-100 text-yellow-800" :
            status === "Confirmed" ? "bg-purple-100 text-purple-800" :
            status === "Shipped" ? "bg-blue-100 text-blue-800" :
            status === "Delivered" ? "bg-green-100 text-green-800" :
            "bg-red-100 text-red-800"
          }`}>{status}</span></p>
          
          <div className="flex flex-wrap gap-4">
            {allowedStatuses.map((newStatus) => {
              const statusConfig = {
                Pending: { bg: "bg-yellow-500 hover:bg-yellow-600", icon: "⏳" },
                Confirmed: { bg: "bg-purple-500 hover:bg-purple-600", icon: "✓" },
                Shipped: { bg: "bg-blue-500 hover:bg-blue-600", icon: "🚚" },
                Delivered: { bg: "bg-green-500 hover:bg-green-600", icon: "✅" },
                Cancelled: { bg: "bg-white hover:bg-red-50 border-2 border-red-400 text-red-600", icon: "✕" }
              };
              
              const config = statusConfig[newStatus];
              const isCancelled = newStatus === "Cancelled";
              
              return (
                <button
                  key={newStatus}
                  onClick={() => updateStatus(newStatus)}
                  className={`flex items-center gap-3 px-6 py-3.5 ${config.bg} ${
                    isCancelled ? "" : "text-white"
                  } font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
                >
                  <span className="text-xl">{config.icon}</span>
                  <span>Mark as {newStatus}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {status === "Delivered" && (
        <div className="mb-12 print:hidden bg-green-50 p-6 rounded-xl border border-green-200">
          <p className="text-green-800 font-semibold text-center">✅ This order has been delivered successfully!</p>
        </div>
      )}

      {/* Customer & Shipping */}
      <div className="grid md:grid-cols-2 gap-10 mb-12">
        <div>
          <h3 className="text-xl font-bold mb-5">Customer Information</h3>
          <div className="bg-gray-50 p-6 rounded-xl">
            <p className="font-semibold text-lg">{order.customer?.name || "Guest Customer"}</p>
            <p className="text-gray-600">{order.customer?.email || "-"}</p>
            <p className="text-gray-600">{order.customer?.phone || "-"}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-5">Shipping Address</h3>
          <div className="bg-gray-50 p-6 rounded-xl text-gray-700">
            <p className="font-semibold text-lg mb-3">{order.customer?.name || "Guest"}</p>
            <p className="text-gray-600 mb-4">{order.customer?.phone || "-"}</p>
            <div className="space-y-2 text-lg">
              <p>{order.shipping?.address?.houseNumber || "-"},</p>
              <p>{order.shipping?.address?.streetNo || "-"},</p>
              <p>{order.shipping?.address?.city || "-"},</p>
              <p className="font-bold text-xl">{order.shipping?.address?.pincode || "-"}</p>
            </div>
            <p className="mt-5 text-sm text-gray-500">
              Delivery Method:{" "}
              <span className="font-medium">{order.shipping?.method || "Standard Delivery"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold mb-6">Order Items</h3>
        <table className="w-full border-collapse bg-white rounded-xl shadow-sm overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-8 py-5 text-left font-bold text-gray-700">Product</th>
              <th className="px-8 py-5 text-left font-bold text-gray-700">Price</th>
              <th className="px-8 py-5 text-left font-bold text-gray-700">Qty</th>
              <th className="px-8 py-5 text-right font-bold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items?.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-8 py-6">{item.product_name || "Unknown Product"}</td>
                <td className="px-8 py-6">₹{fmt(item.price)}</td>
                <td className="px-8 py-6">{item.quantity}</td>
                <td className="px-8 py-6 text-right font-semibold">
                  ₹{fmt(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-bold">
            <tr>
              <td colSpan="3" className="px-8 py-5 text-right text-lg">
                Subtotal
              </td>
              <td className="px-8 py-5 text-right text-xl">₹{fmt(order.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan="3" className="px-8 py-5 text-right text-lg">
                Platform Fee
              </td>
              <td className="px-8 py-5 text-right text-xl">₹{fmt(order.platform_charge)}</td>
            </tr>
            <tr className="bg-gray-200">
              <td colSpan="3" className="px-8 py-6 text-right text-2xl font-bold">
                Total Amount
              </td>
              <td className="px-8 py-6 text-right text-3xl font-bold text-blue-600">
                ₹{fmt(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OrderDetails;