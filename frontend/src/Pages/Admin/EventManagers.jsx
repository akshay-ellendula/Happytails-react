import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";

export default function EventManagers() {
  const [managers, setManagers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const getEventManagers = async () => {
    try {
      const res = await axiosInstance.get("/admin/event-managers");
      if (res.data.success) {
        setManagers(res.data.eventManagers);
      }
    } catch (err) {
      console.log("Error fetching event managers:", err);
    }
  };

  const getStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/event-managers/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.log("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getEventManagers(), getStats()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const columns = [
    { label: "Name", key: "name" },
    { label: "Organization", key: "organization" },
    { label: "Email", key: "email" },
    {
      label: "Joined Date",
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
          onClick={() => (window.location.href = `/admin/event-managers/${row.id}`)}
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
        <Header title="Event Manager Management" />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Event Managers</h3>
              <p className="text-2xl font-semibold">{stats.total ?? 0}</p>
              <p className="text-green-600 text-sm">
                {stats.managerGrowthPercent >= 0 ? "+" : ""}
                {stats.managerGrowthPercent}% from last month
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Revenue Generated</h3>
              <p className="text-2xl font-semibold">₹{stats.revenue ?? 0}</p>
              <p className="text-green-600 text-sm">
                {stats.revenueGrowthPercent >= 0 ? "+" : ""}
                {stats.revenueGrowthPercent}%
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Events</h3>
              <p className="text-2xl font-semibold">{stats.totalEvents ?? 0}</p>
              <p className="text-green-600 text-sm">
                {stats.eventsGrowthPercent >= 0 ? "+" : ""}
                {stats.eventsGrowthPercent}% from last month
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Today's Events</h3>
              <p className="text-2xl font-semibold">{stats.todayEvents ?? 0}</p>
              <p className="text-green-600 text-sm">
                {stats.todayEventsChange >= 0 ? "+" : ""}
                {stats.todayEventsChange} from yesterday
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <input
              type="text"
              placeholder="Search event managers by name or event..."
              className="w-full border px-3 py-2 rounded-md bg-gray-50"
            />
          </div>

          <h2 className="text-lg font-semibold mb-4">Event Manager List</h2>

          {loading ? <Loader /> : <Table columns={columns} data={managers} />}
        </div>
      </div>
    </div>
  );
}
