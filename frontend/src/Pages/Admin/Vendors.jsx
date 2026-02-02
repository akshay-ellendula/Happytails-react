import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";
import "./admin-styles.css";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const VENDORS_PER_PAGE = 10;
  const [page, setPage] = useState(1);

  // Fetch vendor list
  const loadVendors = async () => {
    try {
      const res = await axiosInstance.get("/admin/vendors");
      if (res.data.success) setVendors(res.data.vendors);
    } catch (err) {
      console.error("Error loading vendors:", err.response?.data || err.message);
    }
  };

  // Fetch stats
  const loadStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/vendors/stats");
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error("Error loading vendor stats:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([loadVendors(), loadStats()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filtering
  const filtered = vendors.filter((v) => {
    const s = search.toLowerCase();
    return (
      v.name?.toLowerCase().includes(s) ||
      v.email?.toLowerCase().includes(s) ||
      v.store_name?.toLowerCase().includes(s)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / VENDORS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * VENDORS_PER_PAGE,
    page * VENDORS_PER_PAGE
  );

  const columns = [
    {
      label: "Manager",
      key: "name",
      render: (name, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold mr-3">
            {name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{name || 'N/A'}</div>
            <div className="text-xs text-gray-500">ID: {row.id?.substring(0, 8) || 'Unknown'}</div>
          </div>
        </div>
      ),
    },
    {
      label: "Shop Name",
      key: "store_name",
      render: (store) => (
        <div className="text-gray-800">{store || 'Not specified'}</div>
      ),
    },
    {
      label: "Email",
      key: "email",
      render: (email) => (
        <div className="text-gray-800">{email || 'N/A'}</div>
      ),
    },
    {
      label: "Joined Date",
      key: "joined_date",
      render: (date) => (
        <div className="text-center">
          <div className="font-semibold text-gray-800">
            {date ? new Date(date).toLocaleDateString() : "N/A"}
          </div>
        </div>
      ),
    },
    {
      label: "Actions",
      key: "action",
      render: (_, row) => (
        <Button
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all duration-300"
          onClick={() => window.location.href = `/admin/vendors/${row.id}`}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Sidebar />

      <div className="ml-64 w-full">
        <Header title="Shop Manager Management" />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Managers</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                  👥
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.totalGrowthPercent >= 0 ? '+' : ''}
                {stats.totalGrowthPercent?.toFixed(0) ?? 0}% from last month
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Revenue</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    ₹{stats.totalRevenue?.toFixed(2) ?? "0.00"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  💰
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.revenueGrowthPercent >= 0 ? '+' : ''}
                {stats.revenueGrowthPercent?.toFixed(0) ?? 0}% from last month
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Orders</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalOrders ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                  🛒
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.ordersGrowthPercent >= 0 ? '+' : ''}
                {stats.ordersGrowthPercent?.toFixed(0) ?? 0}% from last month
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Today's Orders</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.todaysOrders ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  ⚡
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.todaysOrdersChange >= 0 ? '+' : ''}
                {stats.todaysOrdersChange?.toFixed(0) ?? 0}% from yesterday
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Shop Manager List</h2>
                <p className="text-gray-600">Manage all shop manager accounts</p>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search managers by name, email, or shop..."
                    className="w-80 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                  <svg 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-lg shadow hover:shadow-lg transition-all duration-300">
                  Filter
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Showing {((page - 1) * VENDORS_PER_PAGE) + 1}-{Math.min(page * VENDORS_PER_PAGE, filtered.length)} of {filtered.length} managers
                {search && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Searching for: "{search}"
                  </span>
                )}
              </div>
              <div className="text-gray-600">
                Page {page} of {totalPages}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Loader />
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="p-6">
                  <Table columns={columns} data={paginated} />
                </div>
                
                {/* No results message */}
                {filtered.length === 0 && search && (
                  <div className="p-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No shop managers found</h3>
                    <p className="text-gray-600">No managers match your search term "{search}"</p>
                    <button
                      onClick={() => setSearch('')}
                      className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
                
                {filtered.length === 0 && !search && (
                  <div className="p-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No shop managers available</h3>
                    <p className="text-gray-600">There are no shop managers in the system yet.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-2xl shadow-lg p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-lg transition ${
                        page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => {
                      const pageNum = i + 1;
                      // Show only first, last, and pages around current page
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
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === page - 2 ||
                        pageNum === page + 2
                      ) {
                        return <span key={i} className="px-2 py-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      className={`px-4 py-2 rounded-lg transition ${
                        page === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}