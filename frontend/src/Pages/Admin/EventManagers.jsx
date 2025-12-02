import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";
import { useNavigate } from "react-router-dom";   // ← ADD THIS LINE

export default function EventManagers() {
  const [managers, setManagers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // For search
  const navigate = useNavigate();   // ← ADD THIS

  // Fetch Event Managers
  const getEventManagers = async () => {
    try {
      const res = await axiosInstance.get("/admin/event-managers");
      if (res.data.success) {
        setManagers(res.data.eventManagers); // make sure backend sends { eventManagers: [...] }
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
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([getEventManagers(), getStats()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filter managers based on search
  const filteredManagers = managers.filter((manager) => {
    const term = searchTerm.toLowerCase();
    return (
      manager.name?.toLowerCase().includes(term) ||
      manager.organization?.toLowerCase().includes(term) ||
      manager.email?.toLowerCase().includes(term)
    );
  });

  const columns = [
    {
      label: "ID",
      key: "id",
      render: (id) => `#${id.substring(0, 12)}`, // shortened for beauty
    },
    { label: "Name", key: "name" },
    { label: "Organization", key: "organization" },
    { label: "Email", key: "email" },
    {
      label: "Joined Date",
      key: "joined_date",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "N/A"),
    },
    {
  label: "Action",
  key: "action",
  render: (_, row) => (
    <Button
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm"
      onClick={() => navigate(`/admin/event-managers/${row.id}`)}
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
                {stats.managerGrowthPercent > 0 && "+"}
                {stats.managerGrowthPercent ?? 0}% from last month
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Revenue Generated</h3>
              <p className="text-2xl font-semibold">₹{stats.revenue ?? 0}</p>
              <p className="text-green-600 text-sm">
                {stats.revenueGrowthPercent > 0 && "+"}
                {stats.revenueGrowthPercent ?? 0}%
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Events</h3>
              <p className="text-2xl font-semibold">{stats.totalEvents ?? 0}</p>
              <p className="text-green-600 text-sm">
                {stats.eventsGrowthPercent > 0 && "+"}
                {stats.eventsGrowthPercent ?? 0}% from last month
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Today's Events</h3>
              <p className="text-2xl font-semibold">{stats.todayEvents ?? 0}</p>
              <p className="text-green-600 text-sm">
                {stats.todayEventsChange > 0 && "+"}
                {stats.todayEventsChange ?? 0} from yesterday
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <input
              type="text"
              placeholder="Search by name, organization or email..."
              className="w-full border px-4 py-2 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <h2 className="text-lg font-semibold mb-4">Event Manager List</h2>

          {loading ? (
            <Loader />
          ) : filteredManagers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No event managers found
            </div>
          ) : (
            <Table columns={columns} data={filteredManagers} />
          )}
        </div>
      </div>
    </div>
  );
}