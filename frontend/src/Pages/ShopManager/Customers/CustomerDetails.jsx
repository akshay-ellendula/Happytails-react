/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, Calendar, ArrowLeft, ShoppingBag, Star } from "lucide-react";

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Customer Details...</p>
      </div>
    </div>
  );
  
  if (!data) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="text-gray-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Customer not found</h3>
        <button
          onClick={() => navigate("/shop/customers")}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Back to Customers
        </button>
      </div>
    </div>
  );

  const { customer, summary, orders } = data;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <button
        onClick={() => navigate("/shop/customers")}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors group"
      >
        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200">
          <ArrowLeft size={20} />
        </div>
        <span className="font-medium">Back to Customers</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{customer.name}</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="text-gray-400" size={18} />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{customer.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="text-gray-400" size={18} />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{customer.phone || "No phone number"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="text-gray-400" size={18} />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {customer.address? `${customer.address.city}, ${customer.address.streetNo}, ${customer.address.houseNumber}, ${customer.address.pincode}`: "No address provided"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="text-gray-400" size={18} />
              <div>
                <p className="text-sm text-gray-500">Joined</p>
                <p className="font-medium">{customer.joined}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Customer Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                <div className="text-sm text-blue-600 font-medium mb-2">Total Orders</div>
                <div className="text-2xl font-bold text-blue-900">{summary.totalOrders}</div>
                <div className="h-2 bg-blue-200 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200">
                <div className="text-sm text-emerald-600 font-medium mb-2">Total Revenue</div>
                <div className="text-2xl font-bold text-emerald-900">₹{summary.totalRevenue}</div>
                <div className="h-2 bg-emerald-200 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                <div className="text-sm text-purple-600 font-medium mb-2">Avg. Order Value</div>
                <div className="text-2xl font-bold text-purple-900">₹{summary.avgOrderValue}</div>
                <div className="h-2 bg-purple-200 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                <div className="text-sm text-orange-600 font-medium mb-2">Last Purchase</div>
                <div className="text-lg font-bold text-orange-900">{summary.lastPurchase}</div>
                <div className="text-xs text-orange-600 mt-2">Recent Activity</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <div className="text-sm text-gray-600 font-medium">Most Purchased</div>
              <div className="text-lg font-bold text-gray-800 mt-1 truncate" title={summary.mostPurchased}>
                {summary.mostPurchased}
              </div>
              <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-gray-800 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Order History</h2>
          <p className="text-gray-500 text-sm mt-1">{orders.length} orders found</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Order ID</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Date</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Items</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Total</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length > 0 ? (
                orders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">
                        #{order.order_id.toString().slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{order.date}</td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="text-gray-600 truncate" title={order.items}>
                        {order.items}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-800">₹{order.total}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <select
                          defaultValue={order.status}
                          onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleDelete(order.order_id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="text-center">
                      <ShoppingBag className="mx-auto text-gray-300" size={48} />
                      <p className="text-gray-500 mt-4">No orders found for this customer.</p>
                    </div>
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