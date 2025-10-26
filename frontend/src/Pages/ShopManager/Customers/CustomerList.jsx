import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../../utils/axios";
import { Search, Eye } from "lucide-react";

import { Link, useNavigate } from "react-router-dom"; // Added useNavigate

const CustomerList = () => {
  const navigate = useNavigate(); // Hook
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get("/vendors/customers").then((res) => {
      if (res.data.success) setCustomers(res.data.customers);
      setLoading(false);
    });
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Loading Customers...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search customers by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full outline-none text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Name</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Email</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Total Orders</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Total Spent</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-800">{c.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{c.email}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-medium">
                        {c.total_orders} Orders
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-800">₹{c.total_spent.toFixed(2)}</td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => navigate(`/shop/customers/${c._id}`)} // Use _id from aggregation
                        className="text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colspan="5" className="py-8 text-center text-gray-500">
                    No customers found matching your search.
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
