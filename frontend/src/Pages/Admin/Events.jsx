import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch events
  const loadEvents = async () => {
    try {
      const res = await axiosInstance.get("/admin/events");
      if (res.data.success) {
        setEvents(res.data.data.events);
        setStats(res.data.data.stats);
      }
    } catch (err) {
      console.error("Error loading events:", err);
    }
  };

  // Fetch stats - Removed as it is included in loadEvents
  /*
  const loadStats = async () => {
    try {
      const res = await axiosInstance.get("/admin/event-stats");
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error("Error loading event stats:", err);
    }
  };
  */

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await axiosInstance.delete(`/admin/events/${id}`);
      if (res.data.success) {
        setEvents((prev) => prev.filter((evt) => evt._id !== id));
      }
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      await loadEvents();
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filteredEvents = events.filter((evt) => {
    const m = evt.event_manager_id?.name?.toLowerCase() || "";
    const n = evt.event_name?.toLowerCase() || "";
    const s = search.toLowerCase();
    return n.includes(s) || m.includes(s);
  });

  const columns = [
    {
      label: "ID",
      key: "id",
      render: (id) => `#${id}`,
    },
    { label: "Event Name", key: "title" },
    {
      label: "Manager",
      key: "managerName",
      render: (val) => val || "N/A",
    },
    {
      label: "Date",
      key: "date_time",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "N/A"),
    },
    { label: "Location", key: "venue" },
    {
      label: "Status",
      key: "date_time",
      render: (val) => {
        const isUpcoming = new Date(val) > new Date();
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs text-white ${isUpcoming ? "bg-green-500" : "bg-gray-500"
              }`}
          >
            {isUpcoming ? "Upcoming" : "Completed"}
          </span>
        );
      },
    },
    {
      label: "Action",
      key: "action",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md"
            onClick={() =>
              (window.location.href = `/admin/events/${row.id}`)
            }
          >
            View
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md"
            onClick={() => deleteEvent(row.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="ml-64 w-full">
        <Header title="Events" />

        <div className="p-6">

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Total Events</h3>
              <p className="text-2xl font-semibold">{stats.totalEvents ?? 0}</p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Upcoming Events</h3>
              <p className="text-2xl font-semibold">
                {stats.upcomingEvents ?? 0}
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Completed Events</h3>
              <p className="text-2xl font-semibold">
                {stats.completedEvents ?? 0}
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm">Tickets Sold</h3>
              <p className="text-2xl font-semibold">{stats.ticketsSold ?? 0}</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
            <input
              type="text"
              placeholder="Search events by name or manager..."
              className="flex-1 border px-3 py-2 rounded-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          {loading ? (
            <Loader />
          ) : (
            <Table columns={columns} data={filteredEvents} />
          )}
        </div>
      </div>
    </div>
  );
}
