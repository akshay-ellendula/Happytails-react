import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

  // Fetch events + stats in one call
  const loadEvents = async () => {
    try {
      const res = await axiosInstance.get("/admin/events");
      if (res.data.success) {
        setEvents(res.data.data.events || []);
        setStats(res.data.data.stats || {});
      }
    } catch (err) {
      console.error("Error loading events:", err);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await axiosInstance.delete(`/admin/events/${id}`);
      if (res.data.success) {
        setEvents((prev) => prev.filter((evt) => evt._id !== id));
        alert("Event deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await loadEvents();
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Safe search filter
  const filteredEvents = events.filter((evt) => {
    const managerName = evt.event_manager_id?.userName?.toLowerCase() || "";
    const eventName = evt.title?.toLowerCase() || "";
    const searchTerm = search.toLowerCase();
    return eventName.includes(searchTerm) || managerName.includes(searchTerm);
  });

  const columns = [
    {
      label: "ID",
      key: "id",
      render: (id) => {
        // SAFELY shorten the ID – fallback if id is missing
        return id ? `#${String(id).slice(-8)}` : "#N/A";
      },
    },
    { label: "Event Name", key: "title" },
    {
      label: "Manager",
      key: "event_manager_id",
      render: (manager) => manager?.userName || "N/A",
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
        if (!val) return <span className="px-3 py-1 bg-gray-400 text-white rounded-full text-xs">Unknown</span>;
        const isUpcoming = new Date(val) > new Date();
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
              isUpcoming ? "bg-green-600" : "bg-gray-600"
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
  render: (_, row) => {
    // This line finds the correct ID no matter how your backend sends it
    const eventId = row._id || row.id || row.eventId || row.event_id;

    // Safety: if for some reason ID is still missing, disable buttons
    if (!eventId) {
      return <span className="text-gray-400 text-xs">Invalid ID</span>;
    }

    return (
      <div className="flex gap-2">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm transition"
          onClick={() => navigate(`/admin/events/${eventId}`)}
        >
          View
        </Button>

        <Button
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm transition"
          onClick={() => deleteEvent(eventId)}
        >
          Delete
        </Button>
      </div>
    );
  },
},
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="ml-64 w-full">
        <Header title="Events Management" />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Events</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {stats.totalEvents ?? 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Upcoming Events</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.upcomingEvents ?? 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Completed Events</h3>
              <p className="text-3xl font-bold text-gray-600 mt-2">
                {stats.completedEvents ?? 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Tickets Sold</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.ticketsSold ?? 0}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <input
              type="text"
              placeholder="Search by event name or manager..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-lg">
              No events found
            </div>
          ) : (
            <Table columns={columns} data={filteredEvents} />
          )}
        </div>
      </div>
    </div>
  );
}