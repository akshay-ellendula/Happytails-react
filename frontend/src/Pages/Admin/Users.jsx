import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";

export default function Users() {
  const [users, setUsers] = useState([]);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const userColumns = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    {
      label: "Joined",
      key: "joined_date",
      render: (value) =>
        value ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
          onClick={() => (window.location.href = `/admin/users/${row._id}`)}
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
        <Header title="Users" />

        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">All Users</h2>

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
