import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";

export default function EventManagers() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getEventManagers = async () => {
    try {
      const res = await axiosInstance.get("/admin/event-managers");
      if (res.data.success) {
        setManagers(res.data.managers);
      }
    } catch (err) {
      console.log("Error fetching event managers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEventManagers();
  }, []);

  const columns = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone", key: "phone" },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
          onClick={() => (window.location.href = `/admin/event-managers/${row._id}`)}
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
        <Header title="Event Managers" />

        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4">All Event Managers</h2>

          {loading ? <Loader /> : <Table columns={columns} data={managers} />}
        </div>
      </div>
    </div>
  );
}
