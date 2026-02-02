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
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const getAllUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/customers");
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.log("Error fetching users:", err);
    }
  };

  const getUserStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/customers/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.log("Error fetching user stats:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getAllUsers(), getUserStats()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userColumns = [
    {
      label: "User",
      key: "name",
      render: (name, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold mr-3">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{name}</div>
            <div className="text-xs text-gray-500">ID: {row.id}</div>
          </div>
        </div>
      ),
    },
    {
      label: "Email",
      key: "email",
      render: (email) => (
        <div className="text-gray-800">{email}</div>
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

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Sidebar />

      <div className="w-full ml-64">
        <Header title="User Management" />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Users</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                  👥
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Monthly Users</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.monthly ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                  📈
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Weekly Users</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.weekly ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  📊
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Today's Users</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.daily ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  ⚡
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">User List</h2>
                <p className="text-gray-600">Manage all user accounts</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="w-96 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Showing {filteredUsers.length} of {users.length} users
                {searchTerm && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Searching for: "{searchTerm}"
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Loader />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <Table columns={userColumns} data={filteredUsers} />
              </div>
              
              {/* No results message */}
              {filteredUsers.length === 0 && searchTerm && (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No users found</h3>
                  <p className="text-gray-600">No users match your search term "{searchTerm}"</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                  >
                    Clear Search
                  </button>
                </div>
              )}
              
              {filteredUsers.length === 0 && !searchTerm && (
                <div className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No users available</h3>
                  <p className="text-gray-600">There are no users in the system yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}