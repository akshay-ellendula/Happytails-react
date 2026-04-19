import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";
import "./admin-styles.css";

export default function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);                      // original basic users
  const [usersWithRevenue, setUsersWithRevenue] = useState([]); // enriched version
  const [stats, setStats] = useState({});
  const [topSpenders, setTopSpenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // ────────────────────────────────────────────────
  // Fetch functions
  // ────────────────────────────────────────────────

  const getAllUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/customers");
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const getUsersWithRevenueData = async () => {
    try {
      const res = await axiosInstance.get("/admin/customers/with-revenue");
      if (res.data.success) {
        setUsersWithRevenue(res.data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users with revenue:", err);
    }
  };

  const getUserStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/customers/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const getTopSpendersData = async () => {
    try {
      const res = await axiosInstance.get("/admin/customers/top-spenders");
      if (res.data.success) {
        setTopSpenders(res.data.topSpenders || []);
      }
    } catch (err) {
      console.error("Error fetching top spenders:", err);
    }
  };

  // ────────────────────────────────────────────────
  // Load data once on mount
  // ────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        getAllUsers(),
        getUsersWithRevenueData(),
        getUserStats(),
        getTopSpendersData(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // ────────────────────────────────────────────────
  // Data source & filtering & sorting
  // ────────────────────────────────────────────────

  const tableData = usersWithRevenue.length > 0 ? usersWithRevenue : users;

  const filteredUsers = tableData.filter(
    (user) =>
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const hasSearch = Boolean(searchTerm);

  const sortedUsers = [...filteredUsers].sort((a, b) => {
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

  // ────────────────────────────────────────────────
  // Table columns
  // ────────────────────────────────────────────────

  const userColumns = [
    {
      label: "User",
      key: "name",
      render: (name, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold mr-3">
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{name || "Unknown"}</div>
            <div className="text-xs text-gray-500">ID: {row.id}</div>
          </div>
        </div>
      ),
    },
    {
      label: "Email",
      key: "email",
      render: (email) => <div className="text-gray-800">{email || "—"}</div>,
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
      render: (value) =>
        value ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      label: "Actions",
      key: "action",
      render: (_, row) => (
        <Button
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all duration-300"
          onClick={() => navigate(`/admin/users/${row.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  // ────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen admin-shell">
      <Sidebar />

      <div className="w-full ml-64 admin-content">
        <Header title="User Management" />

        <div className="p-6">
          {/* ─── Stats Cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">
                    Total Users
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {stats.total ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                  👥
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">
                    Monthly Users
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {stats.monthly ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                  📈
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">
                    Active Users
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {stats.active ?? stats.total ?? 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  ✅
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">
                    Total Revenue
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    ₹{(stats.totalRevenue ?? 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  ₹
                </div>
              </div>
            </div>
          </div>

          {/* ─── Top Spenders ────────────────────────────────────── */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Spenders</h2>
            {topSpenders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {topSpenders.map((user, index) => (
                  <div
                    key={user.id}
                    className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-[1.02]"
                  >
                    <div className="absolute top-4 left-4 h-12 w-12 bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-2xl font-bold flex items-center justify-center rounded-full shadow-lg ring-4 ring-white transform group-hover:scale-110 transition-transform">
                      #{index + 1}
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-5xl font-bold shadow-inner">
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-yellow-700 transition-colors">
                          {user.name}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">{user.email}</p>
                      </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-100">
                      <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                        Total Spent
                      </div>
                      <div className="text-5xl font-extrabold text-gray-900">
                        ₹{user.totalSpent.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-8">
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <div className="text-gray-600 text-sm">Products</div>
                        <div className="text-xl font-semibold text-gray-900 mt-1">
                          ₹{user.spentOnProducts.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-5">
                        <div className="text-gray-600 text-sm">Events</div>
                        <div className="text-xl font-semibold text-gray-900 mt-1">
                          ₹{user.spentOnEvents.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                <div className="text-gray-500 text-lg">
                  No spending data available yet.
                </div>
              </div>
            )}
          </div>

          {/* ─── User List + Search + Sort Filter ────────────────── */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 premium-hover-card">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">User List</h2>
                <p className="text-gray-600 mt-1">Manage all user accounts</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-80 md:w-96">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
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
              Showing {sortedUsers.length} of {tableData.length} users
              {hasSearch && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs">
                  Searching: "{searchTerm}"
                </span>
              )}
            </div>

            {loading ? (
              <div className="py-20">
                <Loader />
              </div>
            ) : (
              <>
                <Table columns={userColumns} data={sortedUsers} />

                {sortedUsers.length === 0 && (
                  <div className="py-16 text-center">
                    {hasSearch ? (
                      <div className="max-w-xl mx-auto rounded-2xl border border-yellow-100 bg-gradient-to-br from-yellow-50 to-white p-8">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-yellow-100 text-yellow-700 flex items-center justify-center text-3xl">
                          🔎
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          No users found
                        </h3>
                        <p className="text-gray-500 mb-6">
                          No matching records for "{searchTerm}"
                        </p>
                        <button
                          onClick={() => setSearchTerm("")}
                          className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                        >
                          Clear Search
                        </button>
                      </div>
                    ) : (
                      <div className="max-w-xl mx-auto rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center text-3xl">
                          📭
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          No users yet
                        </h3>
                        <p className="text-gray-500">
                          No customer accounts have been created.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
