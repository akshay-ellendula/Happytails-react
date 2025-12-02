import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Calendar, ArrowLeft } from "lucide-react";

const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/vendors/customers/${customerId}`).then((res) => {
      if (res.data.success) setData(res.data);
      
      setLoading(false);
    });
  }, [customerId]);

  if (loading) return <div className="p-8 text-center">Loading Customer Details...</div>;
  if (!data) return <div className="p-8 text-center">Customer not found.</div>;

  const { customer, summary, orders } = data;

const handleStatusChange = async (orderId, newStatus) => {
  try {
    await axiosInstance.patch(`/vendors/orders/${orderId}/status`, { status: newStatus });
    const res = await axiosInstance.get(`/vendors/customers/${customerId}`);
    setData(res.data);
  } catch (err) {
    alert("Failed to update status");
  }
};

const handleDelete = async (orderId) => {
  if (!confirm("Delete this order permanently?")) return;
  try {
    await axiosInstance.delete(`/vendors/orders/${orderId}`);
    const res = await axiosInstance.get(`/vendors/customers/${customerId}`);
    setData(res.data);
  } catch (err) {
    alert("Failed to delete order");
  }
};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate("/shop/customers")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Customers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Customer Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{customer.name}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail size={18} />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone size={18} />
              <span>{customer.phone || "No phone number"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin size={18} />
              <span>
                {customer.address? `${customer.address.city}, ${customer.address.streetNo}, ${customer.address.houseNumber}, ${customer.address.pincode}`: "No address provided"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar size={18} />
              <span>Joined: {customer.joined}</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Customer Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Orders</div>
              <div className="text-2xl font-bold text-blue-900">{summary.totalOrders}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Revenue</div>
              <div className="text-2xl font-bold text-green-900">₹{summary.totalRevenue}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Avg. Order Value</div>
              <div className="text-2xl font-bold text-purple-900">₹{summary.avgOrderValue}</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-orange-600 font-medium">Last Purchase</div>
              <div className="text-lg font-bold text-orange-900">{summary.lastPurchase}</div>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg col-span-2 md:col-span-1">
              <div className="text-sm text-pink-600 font-medium">Most Purchased</div>
              <div className="text-lg font-bold text-pink-900 truncate" title={summary.mostPurchased}>
                {summary.mostPurchased}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Order History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Order ID</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Date</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Items</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Total</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length > 0 ? (
                orders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-800">
                      #{order.order_id.toString().slice(-6).toUpperCase()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{order.date}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate" title={order.items}>
                      {order.items}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-800">₹{order.total}</td>
                    <td className="py-4 px-6">
  <div className="flex items-center gap-3">
    <select
      defaultValue={order.status}
      onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
      className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="Confirmed">Confirmed</option>
  <option value="Shipped">Shipped</option>
  <option value="Delivered">Delivered</option>
  <option value="Cancelled">Cancelled</option>
    </select>

    <button
      onClick={() => handleDelete(order.order_id)}
      className="text-red-600 hover:text-red-800 font-medium text-sm"
    >
      Delete
    </button>
  </div>
</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No orders found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
