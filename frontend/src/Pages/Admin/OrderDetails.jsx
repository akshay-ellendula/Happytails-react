import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Loader from "./Components/Loader";
import { fetchOrderDetails, clearSelectedOrder } from "../../store/ordersSlice";
import { axiosInstance } from "../../utils/axios";
import "./admin-styles.css";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selected: order,
    loading,
    error,
  } = useSelector((state) => state.orders);
  const [statusValue, setStatusValue] = React.useState("Pending");
  const [statusSaving, setStatusSaving] = React.useState(false);
  const [addressSaving, setAddressSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [addressForm, setAddressForm] = React.useState({
    name: "",
    houseNumber: "",
    streetNo: "",
    city: "",
    pincode: "",
  });
  const [toast, setToast] = React.useState({
    visible: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id));
    }
    return () => dispatch(clearSelectedOrder());
  }, [dispatch, id]);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (order?.status) {
      setStatusValue(order.status);
    }
  }, [order?.status]);

  useEffect(() => {
    if (order?.shippingAddress) {
      setAddressForm({
        name: order.shippingAddress.name || "",
        houseNumber: order.shippingAddress.houseNumber || "",
        streetNo: order.shippingAddress.streetNo || "",
        city: order.shippingAddress.city || "",
        pincode: order.shippingAddress.pincode || "",
      });
    }
  }, [order?.shippingAddress]);

  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2600);
    return () => clearTimeout(timer);
  }, [toast.visible]);

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
  };

  const handleUpdateStatus = async (nextStatus = statusValue) => {
    if (!id) return;

    const statusToSend = String(nextStatus).trim();

    if (!statusToSend || statusToSend === "[object Object]") {
      showToast("error", "Please select a valid status");
      return;
    }

    setStatusSaving(true);
    try {
      await axiosInstance.patch(`/admin/orders/${id}/status`, {
        status: statusToSend,
      });
      setStatusValue(statusToSend);
      await dispatch(fetchOrderDetails(id));
      showToast("success", "Order status updated");
    } catch (err) {
      console.error("Status update failed");
      showToast("error", "Failed to update order status");
    } finally {
      setStatusSaving(false);
    }
  };

  const getQuickStatusActions = (currentStatus) => {
    if (currentStatus === "Pending") return ["Confirmed", "Cancelled"];
    if (currentStatus === "Confirmed") return ["Shipped", "Cancelled"];
    if (currentStatus === "Out for Delivery") return ["Delivered", "Cancelled"];
    if (currentStatus === "Shipped") return ["Delivered", "Cancelled"];
    return [];
  };

  const quickActions = getQuickStatusActions(order?.status);

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(String(order?.orderId || ""));
      showToast("success", "Order ID copied");
    } catch (err) {
      console.error("Failed to copy order id:", err);
      showToast("error", "Could not copy order ID");
    }
  };

  const handleDeleteOrder = async () => {
    if (!id) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?",
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await axiosInstance.delete(`/admin/orders/${id}`);
      showToast("success", "Order deleted successfully");
      navigate("/admin/orders");
    } catch (err) {
      console.error("Failed to delete order:", err);
      showToast("error", "Failed to delete order");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateAddress = async () => {
    if (!id) return;

    if (
      !addressForm.name.trim() ||
      !addressForm.city.trim() ||
      !addressForm.pincode.trim()
    ) {
      showToast("error", "Name, city and pincode are required");
      return;
    }

    setAddressSaving(true);
    try {
      await axiosInstance.patch(`/admin/orders/${id}/address`, {
        shippingAddress: addressForm,
      });
      await dispatch(fetchOrderDetails(id));
      showToast("success", "Delivery address updated");
    } catch (err) {
      console.error("Failed to update delivery address:", err);
      showToast(
        "error",
        err?.response?.data?.message || "Failed to update delivery address",
      );
    } finally {
      setAddressSaving(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500";
      case "Confirmed":
        return "bg-blue-500";
      case "Shipped":
        return "bg-cyan-600";
      case "Delivered":
        return "bg-green-600";
      case "Cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex admin-shell">
        <Sidebar />
        <div className="flex-1 ml-64 admin-content">
          <Header title="Order Details" />
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 premium-hover-card">
              <Loader />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex admin-shell">
        <Sidebar />
        <div className="flex-1 ml-64 admin-content">
          <Header title="Order Details" />
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center premium-hover-card">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Error Loading Order
              </h2>
              <p className="text-gray-600 mb-6">Error: {error}</p>
              <button
                onClick={() => navigate("/admin/orders")}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex admin-shell">
        <Sidebar />
        <div className="flex-1 ml-64 admin-content">
          <Header title="Order Details" />
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center premium-hover-card">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Order Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                The order could not be found.
              </p>
              <button
                onClick={() => navigate("/admin/orders")}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const orderCode = `#ORD${String(order.orderId).slice(-3).padStart(3, "0")}`;
  const totalAmount = order.totalAmount || 0;
  const isAddressEditable = ["Pending", "Confirmed"].includes(order.status);
  const addressHistory = (order.timeline || [])
    .filter((entry) =>
      String(entry?.description || "")
        .toLowerCase()
        .includes("delivery address updated by admin"),
    )
    .sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex admin-shell">
      <Sidebar />

      <div className="flex-1 ml-64 admin-content">
        <Header title="Order Details" />

        <main className="p-6">
          {toast.visible && (
            <div className="fixed top-20 right-6 z-[60]">
              <div
                className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold ${
                  toast.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {toast.message}
              </div>
            </div>
          )}

          {/* Header with Back Button */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Orders
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Order
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 premium-hover-card">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-full md:w-72">
                <label className="block text-sm text-gray-600 mb-2 font-medium">
                  Update Order Status
                </label>
                <select
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleUpdateStatus()}
                  disabled={statusSaving}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-60"
                >
                  {statusSaving ? "Updating..." : "Update Status"}
                </button>
                <button
                  onClick={handleDeleteOrder}
                  disabled={deleting}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete Order"}
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3">
              <button
                onClick={() => dispatch(fetchOrderDetails(id))}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold"
              >
                Refresh
              </button>
              <button
                onClick={handleCopyOrderId}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-semibold"
              >
                Copy Order ID
              </button>
              {quickActions.map((nextStatus) => (
                <button
                  key={nextStatus}
                  onClick={() => handleUpdateStatus(nextStatus)}
                  disabled={statusSaving || deleting}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 text-sm font-semibold disabled:opacity-60"
                >
                  Mark {nextStatus}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 premium-hover-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Delivery Address
              </h3>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  isAddressEditable
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {isAddressEditable
                  ? "Editable (Pending/Confirmed)"
                  : `Locked in ${order.status}`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Name</label>
                <input
                  type="text"
                  value={addressForm.name}
                  onChange={(e) => handleAddressChange("name", e.target.value)}
                  disabled={!isAddressEditable || addressSaving}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  House Number
                </label>
                <input
                  type="text"
                  value={addressForm.houseNumber}
                  onChange={(e) =>
                    handleAddressChange("houseNumber", e.target.value)
                  }
                  disabled={!isAddressEditable || addressSaving}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Street
                </label>
                <input
                  type="text"
                  value={addressForm.streetNo}
                  onChange={(e) =>
                    handleAddressChange("streetNo", e.target.value)
                  }
                  disabled={!isAddressEditable || addressSaving}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">City</label>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                  disabled={!isAddressEditable || addressSaving}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={addressForm.pincode}
                  onChange={(e) =>
                    handleAddressChange("pincode", e.target.value)
                  }
                  disabled={!isAddressEditable || addressSaving}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-yellow-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleUpdateAddress}
                disabled={!isAddressEditable || addressSaving}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-60"
              >
                {addressSaving ? "Saving Address..." : "Save Address"}
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Address Change History
              </h4>
              {addressHistory.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No address edits recorded for this order.
                </p>
              ) : (
                <div className="space-y-2">
                  {addressHistory.slice(0, 6).map((entry, idx) => (
                    <div
                      key={`${entry.date || "na"}-${idx}`}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <p className="text-sm text-gray-800 font-medium">
                        {entry.description || "Address updated"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {entry.date
                          ? new Date(entry.date).toLocaleString()
                          : "Time unavailable"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">
                    Total Amount
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    ₹{totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                  💰
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">
                    Order Status
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {order.status}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                  📦
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">
                    Items
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {order.items?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  🛍️
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">
                    Payment Method
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {order.paymentMethod || "N/A"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  💳
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 premium-hover-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Summary */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Order Summary
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {orderCode}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className="text-lg font-semibold text-gray-800">
                      <span
                        className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Date</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(order.orderDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {order.paymentLastFour
                        ? `****${order.paymentLastFour}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Customer Information
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {order.customer?.name || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {order.customer?.email || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {order.customer?.phone || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">
                      Delivery Address
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {order.shippingAddress?.name ? (
                        <>
                          {order.shippingAddress.houseNumber &&
                            `${order.shippingAddress.houseNumber}, `}
                          {order.shippingAddress.streetNo &&
                            `${order.shippingAddress.streetNo}, `}
                          {order.shippingAddress.city &&
                            `${order.shippingAddress.city}`}
                          {order.shippingAddress.pincode &&
                            ` - ${order.shippingAddress.pincode}`}
                        </>
                      ) : (
                        order.customer?.address || "N/A"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 premium-hover-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Order Items</h3>
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                {order.items?.length || 0}{" "}
                {order.items?.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {order.items?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left font-semibold text-gray-700">
                        Product ID
                      </th>
                      <th className="p-3 text-left font-semibold text-gray-700">
                        Product Name
                      </th>
                      <th className="p-3 text-left font-semibold text-gray-700">
                        Vendor
                      </th>
                      <th className="p-3 text-left font-semibold text-gray-700">
                        Price
                      </th>
                      <th className="p-3 text-left font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="p-3 text-left font-semibold text-gray-700">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">
                          {item.productId || "N/A"}
                        </td>
                        <td className="p-3 font-semibold">
                          {item.productName}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {item.vendorName}
                        </td>
                        <td className="p-3 font-semibold">
                          ₹{item.price?.toFixed(2) || "0.00"}
                        </td>
                        <td className="p-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-gray-800">
                          ₹
                          {((item.price || 0) * (item.quantity || 0)).toFixed(
                            2,
                          )}
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-gray-50">
                      <td
                        colSpan="5"
                        className="p-3 text-right font-bold text-gray-800"
                      >
                        Total Amount:
                      </td>
                      <td className="p-3 font-bold text-xl text-green-600">
                        ₹{totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-gray-600">No items found in this order</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderDetails;
