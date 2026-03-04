import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import "./admin-styles.css";

export default function EventManagers() {
  const [managers, setManagers] = useState([]);
  const [managersWithRevenue, setManagersWithRevenue] = useState([]);
  const [stats, setStats] = useState({});
  const [topManagers, setTopManagers] = useState([]);   // ← NEW
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  // Fetch Event Managers
  const getEventManagers = async () => {
    try {
      const res = await axiosInstance.get("/admin/event-managers");
      if (res.data.success) {
        setManagers(res.data.eventManagers || []);
      }
    } catch (err) {
      console.error("Error fetching event managers:", err);
    }
  };

  // Fetch Stats
  const getStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/event-managers/stats");
      if (res.data.success) {
        setStats(res.data.stats || {});
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // NEW: Fetch Top 3 Event Managers by Ticket Revenue
  const getTopManagers = async () => {
    try {
      const res = await axiosInstance.get("/admin/event-managers/top-managers");
      if (res.data.success) {
        setTopManagers(res.data.topManagers || []);
      }
    } catch (err) {
      console.error("Error fetching top managers:", err);
    }
  };

  // Fetch event managers with revenue
  const getManagersWithRevenue = async () => {
    try {
      const res = await axiosInstance.get("/admin/event-managers/with-revenue");
      if (res.data.success) {
        setManagersWithRevenue(res.data.eventManagers || []);
      }
    } catch (err) {
      console.error("Error fetching managers with revenue:", err);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([getEventManagers(), getStats(), getTopManagers(), getManagersWithRevenue()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Data source & filtering & sorting
  const tableData = managersWithRevenue.length > 0 ? managersWithRevenue : managers;

  const filteredManagers = tableData.filter((manager) => {
    const term = searchTerm.toLowerCase();
    return (
      manager.name?.toLowerCase().includes(term) ||
      manager.organization?.toLowerCase().includes(term) ||
      manager.email?.toLowerCase().includes(term)
    );
  });

  const sortedManagers = [...filteredManagers].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.joined_date) - new Date(a.joined_date);
    }
    if (sortBy === "revenue-desc") {
      return (b.revenue || 0) - (a.revenue || 0);
    }
    if (sortBy === "revenue-asc") {
      return (a.revenue || 0) - (b.revenue || 0);
    }
    return 0;
  });

  const columns = [
    {
      label: "Manager",
      key: "name",
      render: (name, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold mr-3">
            {name?.charAt(0).toUpperCase() || 'E'}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{name || 'N/A'}</div>
            <div className="text-xs text-gray-500">ID: {row.id?.substring(0, 8) || 'Unknown'}</div>
          </div>
        </div>
      ),
    },
    {
      label: "Organization",
      key: "organization",
      render: (org) => (
        <div className="text-gray-800">{org || 'Not specified'}</div>
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
      label: "Revenue",
      key: "revenue",
      render: (revenue) => (
        <div className="text-gray-800 font-medium">
          ₹{(revenue || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },
    {
      label: "Joined Date",
      key: "joined_date",
      render: (value) => (
        <div className="text-center">
          <div className="font-semibold text-gray-800">
            {value ? new Date(value).toLocaleDateString() : "N/A"}
          </div>
        </div>
      ),
    },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <Button
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all duration-300"
          onClick={() => navigate(`/admin/event-managers/${row.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Sidebar />

      <div className="w-full ml-64">
        <Header title="Event Manager Management" />

        <div className="p-6">
          {/* Stats Cards - your original version */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Event Managers</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                  🎪
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.managerGrowthPercent > 0 ? '+' : ''}{stats.managerGrowthPercent ?? 0}% from last month
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Revenue</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">₹{stats.revenue?.toLocaleString() ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  💰
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.revenueGrowthPercent > 0 ? '+' : ''}{stats.revenueGrowthPercent ?? 0}% growth
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Events</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalEvents ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                  📅
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.eventsGrowthPercent > 0 ? '+' : ''}{stats.eventsGrowthPercent ?? 0}% from last month
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Today's Events</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.todayEvents ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  ⚡
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.todayEventsChange > 0 ? '+' : ''}{stats.todayEventsChange ?? 0} from yesterday
              </div>
            </div>
          </div>

          {/* ====================== TOP 3 EVENT MANAGERS ====================== */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Performing Event Managers</h2>
            <p className="text-gray-600 mb-6">Highest ticket revenue generated (All time)</p>

            {topManagers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topManagers.map((manager, index) => (
                  <div
                    key={manager.id}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-4xl font-bold text-yellow-600 mb-2">#{index + 1}</div>
                        <h3 className="text-xl font-bold text-gray-800">{manager.name}</h3>
                        <p className="text-gray-600">{manager.organization || 'Individual'}</p>
                        <p className="text-sm text-gray-500 mt-1">{manager.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          ₹{manager.totalRevenue.toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-gray-500">Total Revenue</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-lg">
                <div className="text-gray-500 text-lg">No ticket revenue data available yet.</div>
              </div>
            )}
          </div>
          {/* ====================== END TOP 3 ====================== */}

          {/* Search Bar + Sort Filter */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Event Manager List</h2>
                <p className="text-gray-600 mt-1">Manage all event manager accounts</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-80 md:w-96">
                  <input
                    type="text"
                    placeholder="Search by name, organization or email..."
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 bg-white text-gray-700 font-medium transition-all duration-300 min-w-[220px] cursor-pointer hover:border-yellow-400 shadow-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="revenue-desc">Revenue: High to Low</option>
                  <option value="revenue-asc">Revenue: Low to High</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-4 flex items-center gap-3">
              Showing {sortedManagers.length} of {tableData.length} managers
              {searchTerm && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                  Searching: "{searchTerm}"
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Loader />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <Table columns={columns} data={sortedManagers} />
              </div>

              {/* No results message - your original version */}
              {sortedManagers.length === 0 && searchTerm && (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No event managers found</h3>
                  <p className="text-gray-600">No managers match your search term "{searchTerm}"</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {sortedManagers.length === 0 && !searchTerm && (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No event managers available</h3>
                  <p className="text-gray-600">There are no event managers in the system yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}