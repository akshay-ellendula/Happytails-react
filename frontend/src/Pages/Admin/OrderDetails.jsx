// src/Pages/Admin/OrderDetails.jsx

import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetails, clearSelectedOrder } from "../../store/ordersSlice";
import { Loader2 } from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux State
  const { selected: order, loading, error } = useSelector((state) => state.orders);

  // Fetch data on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id));
    }
    // Cleanup function
    return () => dispatch(clearSelectedOrder());
  }, [dispatch, id]);

  // --- Utility Functions (from .js) ---
  const handlePrint = () => {
    window.print();
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

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 text-xl mb-4">Error: {error}</p>
        <button
          onClick={() => navigate("/admin/orders")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) return <div className="p-10 text-center text-2xl">Order not found</div>;

  // --- Rendered Component ---
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen font-sans text-gray-800">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <button onClick={() => navigate("/admin/orders")} className="bg-green-500 text-white px-4 py-2 rounded">
            ← Back to Orders
          </button>
          <button 
            id="print-order-btn" 
            onClick={handlePrint} 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
          >
            Print Order
          </button>
        </div>

        {/* Order Summary and Customer Info (Grid Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* Order Summary Box */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Summary</h2>
            <table className="w-full text-left">
              <tbody>
                <tr><td className="font-semibold w-1/2 py-1">Order ID:</td><td id="orderId" className="py-1 text-sm">#ORD-{order.orderId}</td></tr>
                <tr><td className="font-semibold py-1">Status:</td><td className="py-1">
                  <span 
                    id="orderStatus" 
                    className={`status-badge px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td></tr>
                <tr><td className="font-semibold py-1">Date:</td><td id="orderDate" className="py-1 text-sm">{new Date(order.orderDate).toLocaleString()}</td></tr>
                
                {/* SAFE AMOUNT ACCESS */}
                <tr><td className="font-semibold py-1">Total Amount:</td><td id="orderTotal" className="py-1 text-sm">₹{(order.totalAmount || 0).toFixed(2)}</td></tr>
                
                <tr><td className="font-semibold py-1">Payment Method:</td><td id="paymentMethod" className="py-1 text-sm">{order.paymentMethod || 'N/A'}</td></tr>
                
                {/* SAFE TRANSACTION ID ACCESS */}
                <tr><td className="font-semibold py-1">Transaction ID:</td><td id="transactionId" className="py-1 text-sm">
                    {order.paymentLastFour ? `****${order.paymentLastFour}` : 'N/A'}
                </td></tr>
              </tbody>
            </table>
          </div>

          {/* Customer Information Box */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Customer Information</h2>
            <table className="w-full text-left">
              <tbody>
                {/* SAFE NESTED ACCESS */}
                <tr><td className="font-semibold w-1/3 py-1">Name:</td><td id="customerName" className="py-1 text-sm">{order.customer?.name || 'N/A'}</td></tr>
                <tr><td className="font-semibold py-1">Email:</td><td id="customerEmail" className="py-1 text-sm">{order.customer?.email || 'N/A'}</td></tr>
                <tr><td className="font-semibold py-1">Phone:</td><td id="customerPhone" className="py-1 text-sm">{order.customer?.phone || 'N/A'}</td></tr>
                <tr><td className="font-semibold py-1">Address:</td><td id="customerAddress" className="py-1 text-sm">{order.customer?.address || 'N/A'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="detail-section mt-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Order Items</h2>
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor (Shop Manager)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody id="orderItemsTable" className="bg-white divide-y divide-gray-200">
                {order.items?.length > 0 ? (
                  order.items.map((item, index) => (
                    <tr key={index} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.productId || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.vendorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                        ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No items found in this order</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;