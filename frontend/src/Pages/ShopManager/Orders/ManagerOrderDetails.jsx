/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../utils/axios";
import {
  Download,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Trash2,
  ArrowLeft,
  Clock,
  IndianRupee,
  MapPin,
  User,
  Calendar,
  ChevronRight,
  MessageSquare,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import lastAutoTable from "jspdf-autotable";

const ManagerOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/vendors/orders/${orderId}`)
      .then((res) => {
        if (res.data.success) {
          setOrder(res.data.order);
          setNotes(res.data.order?.vendor_notes || []);
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load order details");
        setLoading(false);
      });
  }, [orderId]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    setNoteLoading(true);
    try {
      const res = await axiosInstance.post(`/vendors/orders/${orderId}/notes`, {
        text: newNote.trim(),
      });
      if (res.data.success) {
        setNotes(res.data.notes || []);
        setNewNote("");
        toast.success("Note added!");
      }
    } catch (err) {
      toast.error("Failed to add note");
    }
    setNoteLoading(false);
  };

  const updateStatus = async (newStatus) => {
    if (!window.confirm(`Mark order as ${newStatus}?`)) return;

    try {
      const res = await axiosInstance.put(`/vendors/orders/${orderId}/status`, {
        status: newStatus,
      });
      setOrder((prev) => {
        const updated = res.data.order || {};
        return {
          ...prev,
          ...updated,
          customer: prev?.customer || updated?.customer || {},
          id: prev?.id || updated?.id || prev?._id,
          order_id: prev?.order_id || updated?.order_id || prev?.id,
        };
      });
      toast.success("Status updated successfully!");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteOrder = async () => {
    if (
      !window.confirm("Delete this order permanently? This cannot be undone.")
    )
      return;

    try {
      await axiosInstance.delete(`/vendors/orders/${orderId}`);
      toast.success("Order deleted successfully");
      navigate("/shop/orders");
    } catch (err) {
      toast.error("Failed to delete order");
    }
  };

  const downloadReceipt = () => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      const subtotal = Number(order?.subtotal || 0);
      const platformFee = Number(order?.platform_charge || subtotal * 0.04);
      const finalTotal = Number(order?.total || subtotal + platformFee);
      const items = Array.isArray(order?.items) ? order.items : [];
      const primary = [26, 26, 26];

      const orderDate = order?.order_date
        ? new Date(order.order_date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "-";

      const customerName =
        order?.customer?.name || order?.customer_name || "Guest Customer";
      const customerEmail = order?.customer?.email || "No email";
      const customerPhone = order?.customer?.phone || "No phone";

      const shippingAddress = [
        order?.shipping?.address?.houseNumber,
        order?.shipping?.address?.streetNo,
        order?.shipping?.address?.city,
        order?.shipping?.address?.pincode,
      ]
        .filter((part) => part && String(part).trim().length > 0)
        .join(", ");

      let yPos = 15;

      // === HEADER ===
      doc.setFillColor(26, 26, 26);
      doc.rect(0, 0, pageWidth, 30, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("HAPPY TAILS", 15, 12);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Pet Care & Supplies", 15, 18);

      doc.setTextColor(200, 200, 200);
      doc.setFontSize(8);
      doc.text("support@happytails.com | +91 98765 43210", pageWidth - 15, 12, {
        align: "right",
      });
      doc.text("www.happytails.com", pageWidth - 15, 18, { align: "right" });

      yPos = 40;

      // === RECEIPT TITLE ===
      doc.setFillColor(255, 254, 139);
      doc.rect(0, yPos - 8, pageWidth, 14, "F");

      doc.setTextColor(26, 26, 26);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("ORDER RECEIPT", 15, yPos);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `#${order?.id || order?._id || orderId}`,
        pageWidth - 15,
        yPos - 3,
        {
          align: "right",
        },
      );

      yPos += 12;

      // === ORDER INFO & DATES ===
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "bold");
      doc.text("Order Information:", 15, yPos);

      doc.setFont("helvetica", "normal");
      yPos += 6;

      doc.text(`Date: ${orderDate}`, 15, yPos);
      doc.text(`Status: ${order?.status || "-"}`, 100, yPos);

      yPos += 8;

      // === CUSTOMER DETAILS BOX ===
      doc.setFillColor(243, 244, 246);
      doc.rect(15, yPos, pageWidth - 30, 32, "F");

      doc.setTextColor(26, 26, 26);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("BILL TO:", 20, yPos + 5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(8);
      let custY = yPos + 11;

      doc.text(customerName, 20, custY);
      custY += 5;
      doc.text(customerEmail, 20, custY);
      custY += 5;
      doc.text(customerPhone, 20, custY);
      custY += 5;

      if (shippingAddress) {
        const splitAddr = doc.splitTextToSize(shippingAddress, pageWidth - 50);
        if (splitAddr[0]) doc.text(splitAddr[0], 20, custY);
      }

      yPos += 38;

      // === ITEMS TABLE ===
      const tableColumn = [
        "Item Name",
        "Size/Color",
        "Qty",
        "Unit Price",
        "Total",
      ];
      const tableRows = [];

      items.forEach((item) => {
        const variant = item?.size ? item.size : "-";
        const color = item?.color ? item.color : "";
        const sizeColor = `${variant}${color ? " / " + color : ""}`;
        const price = Number(item?.price || 0);
        const qty = Number(item?.quantity || 0);
        const itemTotal = price * qty;

        tableRows.push([
          item?.product_name || "Product",
          sizeColor,
          qty.toString(),
          `Rs. ${price.toFixed(2)}`,
          `Rs. ${itemTotal.toFixed(2)}`,
        ]);
      });

      lastAutoTable(doc, {
        startY: yPos,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        headStyles: {
          fillColor: primary,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
          cellPadding: 4,
          fontSize: 8,
          lineColor: [200, 200, 200],
        },
        bodyStyles: {
          textColor: [60, 60, 60],
          cellPadding: 3,
          fontSize: 8,
          lineColor: [230, 230, 230],
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        columnStyles: {
          0: { cellWidth: 50, halign: "left" },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 15, halign: "center" },
          3: { cellWidth: 35, halign: "right" },
          4: { cellWidth: 35, halign: "right", fontStyle: "bold" },
        },
        margin: { left: 15, right: 15 },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // === BILLING SUMMARY ===
      const summaryLeft = pageWidth / 2 + 10;
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");

      doc.text("Subtotal:", summaryLeft, yPos);
      doc.text(`Rs. ${subtotal.toFixed(2)}`, pageWidth - 15, yPos, {
        align: "right",
      });

      yPos += 6;
      doc.text("Delivery Fee:", summaryLeft, yPos);
      doc.text("FREE", pageWidth - 15, yPos, { align: "right" });

      yPos += 6;
      doc.text("Platform Charge (4%):", summaryLeft, yPos);
      doc.text(`Rs. ${platformFee.toFixed(2)}`, pageWidth - 15, yPos, {
        align: "right",
      });

      // === TOTAL BOX ===
      yPos += 8;
      doc.setFillColor(255, 254, 139);
      doc.rect(summaryLeft - 5, yPos - 4, pageWidth - summaryLeft, 12, "F");

      doc.setTextColor(26, 26, 26);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("GRAND TOTAL:", summaryLeft, yPos + 4);
      doc.text(`Rs. ${finalTotal.toFixed(2)}`, pageWidth - 15, yPos + 4, {
        align: "right",
      });

      // === FOOTER ===
      yPos = pageHeight - 45;

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(15, yPos, pageWidth - 15, yPos);

      yPos += 8;
      doc.setFontSize(8);
      doc.setTextColor(26, 26, 26);
      doc.setFont("helvetica", "bold");
      doc.text("RETURN & REFUND POLICY", 15, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(7);
      yPos += 5;

      const policies = [
        "• Returns accepted within 14 days of delivery",
        "• Items must be unused and in original packaging",
        "• Include this receipt with your return",
        "• Platform charges are non-refundable",
      ];

      policies.forEach((policy) => {
        doc.text(policy, 15, yPos);
        yPos += 4;
      });

      // === THANK YOU ===
      yPos = pageHeight - 8;
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text(
        "Thank you for shopping with Happy Tails! 🐾",
        pageWidth / 2,
        yPos,
        { align: "center" },
      );

      doc.save(`Happytails_Receipt_${order?.id || order?._id || orderId}.pdf`);
      toast.success("Receipt downloaded successfully");
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error("Failed to generate receipt. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Order not found
          </h3>
          <button
            onClick={() => navigate("/shop/orders")}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const fmt = (num) => Number(num || 0).toFixed(2);

  const safeFormatDate = (d, opts = {}) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", opts);
  };

  const safeFormatTime = (d, opts = {}) => {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-IN", opts);
  };

  const status = order.status;
  const timeline = order.timeline || [];

  const getAllowedNextStatuses = () => {
    if (status === "Pending") return ["Confirmed", "Cancelled"];
    if (status === "Confirmed") return ["Shipped", "Cancelled"];
    if (status === "Shipped")
      return ["Out for Delivery", "Delivered", "Cancelled"];
    if (status === "Out for Delivery") return ["Delivered", "Cancelled"];
    if (status === "Delivered") return [];
    return [];
  };

  const allowedStatuses = getAllowedNextStatuses();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Orders</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-500 mt-1">
              Order #{order.id?.slice(-6).toUpperCase() || orderId}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={downloadReceipt}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white border border-black rounded-xl hover:bg-gray-800 hover:border-gray-800 transition-colors cursor-pointer shadow-sm"
          >
            <Download size={20} />
            <span className="font-medium">Download Receipt</span>
          </button>
          <button
            onClick={deleteOrder}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            <Trash2 size={20} />
            <span className="font-medium">Delete</span>
          </button>
        </div>
      </div>

      {/* Order Status & Timeline */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Timeline</h2>
            <p className="text-gray-500 text-sm mt-1">Track order progress</p>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              status === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : status === "Confirmed"
                  ? "bg-purple-100 text-purple-800"
                  : status === "Shipped"
                    ? "bg-blue-100 text-blue-800"
                    : status === "Delivered"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Order Placed */}
          <div className="flex items-start gap-6 mb-8 relative">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center z-10">
              <Package size={24} className="text-white" />
            </div>
            <div className="flex-1 pt-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">Order was placed</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {safeFormatDate(order.order_date, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    {safeFormatTime(order.order_date, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Events */}
          {timeline.map((event, index) => (
            <div key={index} className="flex items-start gap-6 mb-8 relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                  event.status === "Shipped"
                    ? "bg-blue-500"
                    : event.status === "Delivered"
                      ? "bg-emerald-500"
                      : event.status === "Cancelled"
                        ? "bg-red-500"
                        : "bg-purple-500"
                }`}
              >
                {event.status === "Shipped" ? (
                  <Truck size={24} className="text-white" />
                ) : event.status === "Delivered" ? (
                  <CheckCircle size={24} className="text-white" />
                ) : event.status === "Cancelled" ? (
                  <XCircle size={24} className="text-white" />
                ) : (
                  <Package size={24} className="text-white" />
                )}
              </div>
              <div className="flex-1 pt-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">
                      {event.status === "Shipped" && "Order has been shipped"}
                      {event.status === "Out for Delivery" &&
                        "Order is out for delivery"}
                      {event.status === "Delivered" &&
                        "Order has been delivered"}
                      {event.status === "Cancelled" &&
                        "Order has been cancelled"}
                      {event.status === "Confirmed" &&
                        "Order Confirmed by seller"}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {safeFormatDate(event.date, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      {safeFormatTime(event.date, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Status Section */}
      {allowedStatuses.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Update Order Status
          </h3>
          <div className="flex flex-wrap gap-3">
            {allowedStatuses.map((newStatus) => {
              const statusConfig = {
                Pending: {
                  bg: "bg-yellow-500 hover:bg-yellow-600",
                  icon: "⏳",
                },
                Confirmed: {
                  bg: "bg-purple-500 hover:bg-purple-600",
                  icon: "✓",
                },
                Shipped: { bg: "bg-blue-500 hover:bg-blue-600", icon: "🚚" },
                "Out for Delivery": {
                  bg: "bg-indigo-500 hover:bg-indigo-600",
                  icon: "📦",
                },
                Delivered: {
                  bg: "bg-emerald-500 hover:bg-emerald-600",
                  icon: "✅",
                },
                Cancelled: { bg: "bg-red-500 hover:bg-red-600", icon: "✕" },
              };

              const config = statusConfig[newStatus];
              return (
                <button
                  key={newStatus}
                  onClick={() => updateStatus(newStatus)}
                  className={`flex items-center gap-2 px-5 py-3 ${config.bg} text-white font-semibold rounded-xl hover:shadow-lg transition-all`}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span>Mark as {newStatus}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer & Shipping Info */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl">
              <User className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Customer Information
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-bold text-gray-900 text-lg">
                {order.customer?.name ||
                  order.customer_name ||
                  "Guest Customer"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-700">
                {order.customer?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-700">
                {order.customer?.phone || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <MapPin className="text-emerald-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Shipping Address
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Recipient</p>
              <p className="font-bold text-gray-900 text-lg">
                {order.customer?.name || order.customer_name || "Guest"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium text-gray-700">
                {order.customer?.phone || "-"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-500">Address</p>
              <div className="text-gray-700">
                <p>{order.shipping?.address?.houseNumber || "-"},</p>
                <p>{order.shipping?.address?.streetNo || "-"},</p>
                <p>{order.shipping?.address?.city || "-"},</p>
                <p className="font-bold text-lg">
                  {order.shipping?.address?.pincode || "-"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Delivery Method</p>
              <p className="font-medium text-gray-700">
                {order.shipping?.method || "Standard Delivery"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Order Items</h3>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Order Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{fmt(order.total)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Product
                </th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Price
                </th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">
                  Qty
                </th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">
                      {item.product_name || "Unknown Product"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-700">₹{fmt(item.price)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-700">{item.quantity}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="font-bold text-gray-900">
                      ₹{fmt(item.price * item.quantity)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan="3"
                  className="py-4 px-6 text-right font-semibold text-gray-700"
                >
                  Subtotal
                </td>
                <td className="py-4 px-6 text-right font-bold text-gray-900">
                  ₹{fmt(order.subtotal)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan="3"
                  className="py-4 px-6 text-right font-semibold text-gray-700"
                >
                  Platform Fee
                </td>
                <td className="py-4 px-6 text-right font-bold text-gray-900">
                  ₹{fmt(order.platform_charge)}
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td
                  colSpan="3"
                  className="py-4 px-6 text-right font-bold text-gray-900 text-lg"
                >
                  Total Amount
                </td>
                <td className="py-4 px-6 text-right font-bold text-gray-900 text-2xl">
                  ₹{fmt(order.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Vendor Notes */}
      <div className="bg-gradient-to-br from-white to-amber-50/30 rounded-2xl shadow-lg border border-amber-100/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 rounded-xl">
            <MessageSquare className="text-amber-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Internal Notes</h3>
            <p className="text-gray-500 text-sm">
              Private notes visible only to you
            </p>
          </div>
        </div>

        {/* Add Note */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Add a note about this order..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none bg-white"
          />
          <button
            onClick={addNote}
            disabled={noteLoading || !newNote.trim()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          >
            <Send size={16} />
            Add
          </button>
        </div>

        {/* Notes List */}
        {notes.length > 0 ? (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {[...notes].reverse().map((note, i) => (
              <div
                key={i}
                className="bg-white border border-amber-100 rounded-xl p-3"
              >
                <p className="text-sm text-gray-800">{note.text}</p>
                <p className="text-xs text-gray-400 mt-1.5">
                  {new Date(note.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            No notes yet. Add one above!
          </p>
        )}
      </div>

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={20} />
            <div>
              <p className="text-sm text-blue-600 font-medium">Order Date</p>
              <p className="font-bold text-blue-900">
                {safeFormatDate(order.order_date, {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
          <div className="flex items-center gap-3">
            <Clock className="text-purple-600" size={20} />
            <div>
              <p className="text-sm text-purple-600 font-medium">Order Time</p>
              <p className="font-bold text-purple-900">
                {safeFormatTime(order.order_date, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
          <div className="flex items-center gap-3">
            <IndianRupee className="text-emerald-600" size={20} />
            <div>
              <p className="text-sm text-emerald-600 font-medium">
                Total Items
              </p>
              <p className="font-bold text-emerald-900">
                {order.items?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
          <div className="flex items-center gap-3">
            <Package className="text-orange-600" size={20} />
            <div>
              <p className="text-sm text-orange-600 font-medium">
                Payment Status
              </p>
              <p className="font-bold text-orange-900">Paid</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerOrderDetails;
