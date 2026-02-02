import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { Search, Eye, Filter, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/vendors/customers").then((res) => {
      console.log(res.data)
      if (res.data.success) setCustomers(res.data.customers);
      setLoading(false);
    });
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Customers...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage your customer relationships</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-emerald-600" size={24} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Search className="text-gray-400" size={20} />
        </div>
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />
        <div className="p-2 bg-gray-100 rounded-lg">
          <Filter className="text-gray-400" size={20} />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Active Customers</p>
          <p className="text-2xl font-bold text-blue-900 mt-2">
            {customers.filter(c => c.total_orders > 0).length}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
          <p className="text-sm text-emerald-600 font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-900 mt-2">
            ₹{customers.reduce((sum, c) => sum + c.total_spent, 0).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Avg Order Value</p>
          <p className="text-2xl font-bold text-purple-900 mt-2">
            ₹{(customers.reduce((sum, c) => sum + c.total_spent, 0) / Math.max(customers.length, 1)).toFixed(2)}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
          <p className="text-sm text-orange-600 font-medium">Repeat Rate</p>
          <p className="text-2xl font-bold text-orange-900 mt-2">
            {customers.filter(c => c.total_orders > 1).length} customers
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Customer List</h2>
            <span className="text-sm text-gray-500">{filteredCustomers.length} customers</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Name</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Email</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Total Orders</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-left">Total Spent</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600">{c.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {c.total_orders} Orders
                        </span>
                        {c.total_orders > 5 && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                            VIP
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-800">₹{c.total_spent.toFixed(2)}</span>
                      <div className="h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${Math.min((c.total_spent / 5000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => navigate(`/shop/customers/${c._id}`)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors group-hover:shadow-lg"
                      >
                        <Eye size={16} />
                        <span className="text-sm font-medium">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="text-gray-400" size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No customers found</h3>
                      <p className="text-gray-500">No customers match your search criteria.</p>
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

export default CustomerList;