import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Table from "./Components/Table";
import Loader from "./Components/Loader";
import Button from "./Components/Button";
import { axiosInstance } from "../../utils/axios";
import "./admin-styles.css";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [topEvents, setTopEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // Fetch events + stats
  const loadEvents = async () => {
    try {
      const res = await axiosInstance.get("/admin/events");
      if (res.data.success) {
        setEvents(res.data.data?.events || []);
        setStats(res.data.data?.stats || {});
      }
    } catch (err) {
      console.error("Error loading events:", err);
    }
  };

  // Fetch Top 3 Events by Revenue
  const loadTopEvents = async () => {
    try {
      const res = await axiosInstance.get("/admin/events/top-events");
      if (res.data.success) {
        setTopEvents(res.data.topEvents || []);
      }
    } catch (err) {
      console.error("Error loading top events:", err);
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
      await Promise.all([loadEvents(), loadTopEvents()]);
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
      label: "Event",
      key: "title",
      render: (title, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold mr-3">
            {title?.charAt(0)?.toUpperCase() || 'E'}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{title || 'N/A'}</div>
            <div className="text-xs text-gray-500">
              ID: {row._id ? `#${String(row._id).slice(-8)}` : '#N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      label: "Manager",
      key: "event_manager_id",
      render: (manager) => (
        <div className="text-gray-800">{manager?.userName || "N/A"}</div>
      ),
    },
    {
      label: "Date",
      key: "date_time",
      render: (val) => (
        <div className="text-center">
          <div className="font-semibold text-gray-800">
            {val ? new Date(val).toLocaleDateString() : "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            {val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </div>
        </div>
      ),
    },
    {
      label: "Location",
      key: "venue",
      render: (venue) => (
        <div className="text-gray-800">{venue || 'Not specified'}</div>
      ),
    },
    {
      label: "Status",
      key: "date_time",
      render: (val) => {
        if (!val) return (
          <span className="px-3 py-1.5 bg-gray-400 text-white rounded-full text-sm font-medium">
            Unknown
          </span>
        );
        const isUpcoming = new Date(val) > new Date();
        return (
          <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
            isUpcoming
              ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200'
              : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200'
          }`}>
            {isUpcoming ? "Upcoming" : "Completed"}
          </span>
        );
      },
    },
    {
      label: "Action",
      key: "action",
      render: (_, row) => {
        const eventId = row._id || row.id || row.eventId || row.event_id;
        if (!eventId) {
          return <span className="text-gray-400 text-sm">Invalid ID</span>;
        }
        return (
          <div className="flex gap-3">
            <Button
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all duration-300"
              onClick={() => navigate(`/admin/events/${eventId}`)}
            >
              View
            </Button>
            <Button
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all duration-300"
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
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <Sidebar />

      <div className="ml-64 w-full">
        <Header title="Events Management" />

        <div className="p-6">
          {/* ─── Stats Cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Events</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalEvents ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                  📅
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.eventsGrowthPercent >= 0 ? '+' : ''}
                {stats.eventsGrowthPercent?.toFixed(0) ?? 0}% from last month
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Total Revenue</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    ₹{stats.totalRevenue?.toLocaleString('en-IN') ?? "0"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  💰
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.revenueGrowthPercent >= 0 ? '+' : ''}
                {stats.revenueGrowthPercent?.toFixed(0) ?? 0}% from last month
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Upcoming Events</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.upcomingEvents ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                  ⏳
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.upcomingGrowthPercent >= 0 ? '+' : ''}
                {stats.upcomingGrowthPercent?.toFixed(0) ?? 0}% from last month
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase tracking-wider">Today's Tickets</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.todaysTickets ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  🎟️
                </div>
              </div>
              <div className="text-sm text-green-600">
                {stats.ticketsTodayChange >= 0 ? '+' : ''}
                {stats.ticketsTodayChange?.toFixed(0) ?? 0}% from yesterday
              </div>
            </div>
          </div>

          {/* ─── Top 3 Revenue Events ─────────────────────────────── */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Top Revenue Events</h2>
            <p className="text-gray-600 mb-6">Highest ticket sales revenue (All time)</p>

            {topEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topEvents.map((event, index) => (
                  <div
                    key={event._id || index}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-4xl font-bold text-yellow-600 mb-1">#{index + 1}</div>
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-2">
                          {event.title || "Untitled Event"}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{event.venue || "—"}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          ₹{(event.totalRevenue || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Total Revenue</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center shadow-lg border border-gray-200">
                <div className="text-gray-500 text-lg">
                  No ticket revenue data available yet
                </div>
              </div>
            )}
          </div>

          {/* ─── Search & Controls ────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Event List</h2>
                <p className="text-gray-600">Manage all events and view details</p>
              </div>

              <div className="relative w-96">
                <input
                  type="text"
                  placeholder="Search by event title or manager name..."
                  className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
            </div>

            {/* Insert your original showing X-Y of Z + page info here if you have it */}
          </div>

          {/* ─── Main Table Area ──────────────────────────────────── */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Loader />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <Table columns={columns} data={filteredEvents} />
              </div>

              {/* 
                PASTE YOUR ORIGINAL NO-RESULTS BLOCKS HERE 
                (the ones with emoji, heading, description, clear button, etc.)
              */}

              {/* Example fallback if you haven't pasted yet */}
              {filteredEvents.length === 0 && (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {search ? "No matching events found" : "No events yet"}
                  </h3>
                  <p className="text-gray-500">
                    {search ? `No results for "${search}"` : "Create your first event to get started"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}