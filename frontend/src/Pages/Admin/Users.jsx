import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch customers (users)
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

  const userColumns = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
          onClick={() => navigate(`/admin/users/${row.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="w-full ml-64">
        <Header title="User Management" />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Users</h3>
              <p className="text-2xl font-semibold">{stats.total ?? 0}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Monthly Users</h3>
              <p className="text-2xl font-semibold">{stats.monthly ?? 0}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Weekly Users</h3>
              <p className="text-2xl font-semibold">{stats.weekly ?? 0}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Today's Users</h3>
              <p className="text-2xl font-semibold">{stats.daily ?? 0}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full border px-3 py-2 rounded-md bg-gray-50"
            />
          </div>

          <h2 className="text-lg font-semibold mb-4">User List</h2>

          {loading ? (
            <Loader />
          ) : (
            <Table columns={userColumns} data={users} />
          )}
        </div>
      </div>
    </div>
  );
}
