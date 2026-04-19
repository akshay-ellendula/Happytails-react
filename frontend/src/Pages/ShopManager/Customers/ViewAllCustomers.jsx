import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../utils/axios";
import {
  Users,
  Search,
  ArrowLeft,
  IndianRupee,
  ShoppingBag,
  User,
} from "lucide-react";

const ViewAllCustomers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const CUSTOMERS_PER_PAGE = 12;
  const [page, setPage] = useState(1);

  const loadAllCustomers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/vendors/customers/all-sorted");
      if (res.data.success) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const name = c.name?.toLowerCase() || "";
    const email = c.email?.toLowerCase() || "";
    const term = search.toLowerCase();
    return name.includes(term) || email.includes(term);
  });

  const totalPages = Math.ceil(filtered.length / CUSTOMERS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * CUSTOMERS_PER_PAGE,
    page * CUSTOMERS_PER_PAGE,
  );

  const totalRevenue = filtered.reduce(
    (sum, c) => sum + (c.totalSpent || 0),
    0,
  );
  const totalOrders = filtered.reduce((sum, c) => sum + (c.orderCount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/shop/dashboard")}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-all duration-300 text-gray-700 hover:text-yellow-600"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Customers</h1>
          <p className="text-gray-500 mt-1">Sorted by spending</p>
        </div>

        <div className="w-32"></div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-yellow-50 rounded-xl p-6 shadow-lg border border-yellow-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm uppercase tracking-wider">
                Total Customers
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {filtered.length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Users className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 shadow-lg border border-purple-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm uppercase tracking-wider">
                Total Revenue
              </h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                ₹{totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <IndianRupee className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm uppercase tracking-wider">
                Total Orders
              </h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {totalOrders}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <ShoppingBag className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="text-sm text-gray-500">
            Showing {(page - 1) * CUSTOMERS_PER_PAGE + 1}-
            {Math.min(page * CUSTOMERS_PER_PAGE, filtered.length)} of{" "}
            {filtered.length}
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginated.map((customer, index) => (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-yellow-400"
            >
              <div className="p-6">
                {/* Rank Badge & Avatar */}
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    #{(page - 1) * CUSTOMERS_PER_PAGE + index + 1}
                  </div>

                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                    {customer.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                    {customer.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {customer.email}
                  </p>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Total Spent
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{(customer.totalSpent || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1">Orders</div>
                      <div className="text-lg font-bold text-blue-600">
                        {customer.orderCount || 0}
                      </div>
                    </div>

                    <div className="flex-1 bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <div className="text-xs text-gray-500 mb-1">
                        Avg Order
                      </div>
                      <div className="text-lg font-bold text-purple-600">
                        ₹
                        {customer.orderCount > 0
                          ? Math.round(
                              customer.totalSpent / customer.orderCount,
                            )
                          : 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Joined Date */}
                <div className="text-xs text-gray-400 text-center pt-3 border-t border-gray-100">
                  Joined{" "}
                  {customer.joined_date
                    ? new Date(customer.joined_date).toLocaleDateString()
                    : "N/A"}
                </div>

                <button
                  onClick={() => navigate(`/shop/customers/${customer.id}`)}
                  className="mt-4 w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <User size={16} />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No customers found
          </h3>
          <p className="text-gray-500">
            {search
              ? `No customers match "${search}"`
              : "You don't have any customers yet."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg transition ${
                page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= page - 1 && pageNum <= page + 1)
              ) {
                return (
                  <button
                    key={i}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 rounded-lg transition ${
                      page === pageNum
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === page - 2 || pageNum === page + 2) {
                return (
                  <span key={i} className="px-2 py-2 text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg transition ${
                page === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllCustomers;
