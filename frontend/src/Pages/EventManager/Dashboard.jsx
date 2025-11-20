import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axios.js"; // Adjust path to where you saved axios.js
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

const Dashboard = ({ setCurrentPage }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  // State for dynamic data
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    ticketsSold: 0,
    totalRevenue: 0,
    totalAttendees: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [ticketBreakdown, setTicketBreakdown] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);

  // --- Helper Functions for Formatting ---
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (date) => {
    const isUpcoming = new Date(date) > new Date();
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    return isUpcoming 
      ? `${baseClasses} bg-blue-100 text-blue-800` 
      : `${baseClasses} bg-gray-100 text-gray-800`;
  };

  const getStatusText = (date) => {
    return new Date(date) > new Date() ? "Upcoming" : "Completed";
  };

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch Events
        // URL is now relative to axiosInstance baseURL (/api)
        // Matches route: router.get('/events/my-events', ...) in eventManagerRoutes.js
        const eventsRes = await axiosInstance.get('/eventManagers/events/my-events');
        const events = eventsRes.data;

        // 2. Fetch Revenue
        // Matches route: router.get('/revenue/my-revenue', ...) in eventManagerRoutes.js
        const revenueRes = await axiosInstance.get('/eventManagers/revenue/my-revenue');
        const totalRevenue = revenueRes.data;

        // 3. Fetch Attendees/Tickets
        // Matches route: router.get('/events/attendees', ...) in eventManagerRoutes.js
        const attendeesRes = await axiosInstance.get('/eventManagers/events/attendees');
        const tickets = attendeesRes.data;

        // 4. Fetch Analytics for Charts
        // Assuming these routes exist in your analytics controller
        const trendRes = await axiosInstance.get('/analytics/revenue-trends');
        const typeRes = await axiosInstance.get('/analytics/event-types');

        // --- Process & Set State ---

        // Metrics Calculation
        setMetrics({
          totalEvents: events.length,
          ticketsSold: tickets.length, 
          totalRevenue: totalRevenue || 0,
          totalAttendees: tickets.length,
        });

        // Process Events (Split into Upcoming vs Recent)
        const now = new Date();
        const sortedEvents = events.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setUpcomingEvents(sortedEvents.filter(e => new Date(e.date) > now).slice(0, 5).map(e => ({
          id: e._id,
          title: e.title,
          date: formatDate(e.date),
          icon: "📅", 
          tickets: { sold: 0, total: e.capacity || 100 },
          status: "upcoming",
          color: "from-blue-400 to-blue-600"
        })));

        setRecentEvents(sortedEvents.filter(e => new Date(e.date) <= now).slice(0, 5).map(e => ({
          id: e._id,
          title: e.title,
          location: e.location || "Online",
          date: formatDate(e.date),
          icon: "✅",
          tickets: { sold: 0, total: e.capacity || 100 },
          status: "completed",
          color: "from-green-400 to-green-600"
        })));

        // Process Recent Tickets
        setRecentTickets(tickets.slice(0, 5).map(t => ({
          id: t._id.substring(0, 10).toUpperCase(),
          event: t.eventId?.title || "Unknown Event",
          customer: t.customerId?.userName || "Unknown User",
          purchaseDate: formatDate(t.createdAt),
          price: t.price || 0,
          status: "active"
        })));

        // Set Chart Data
        setRevenueTrend(trendRes.data || []); 
        setTicketBreakdown(typeRes.data || []);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Metric Cards Configuration ---
  const metricCards = [
    {
      title: "Total Events",
      value: metrics.totalEvents,
      change: "Active",
      icon: "📅",
      bgColor: "bg-blue-100",
    },
    {
      title: "Tickets Sold",
      value: metrics.ticketsSold.toLocaleString(),
      change: "Total",
      icon: "🎫",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Revenue",
      value: `₹${metrics.totalRevenue.toLocaleString()}`,
      change: "Gross",
      icon: "💰",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total Attendees",
      value: metrics.totalAttendees.toLocaleString(),
      change: "Confirmed",
      icon: "👥",
      bgColor: "bg-purple-100",
    },
  ];

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              Event Manager Dashboard
            </h1>
            <p className="text-gray-600">Overview of your performance</p>
          </div>
          <button
            onClick={() => setCurrentPage("create-event")}
            className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>Create Event</span>
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {metricCards.map((metric, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${metric.bgColor} rounded-lg flex items-center justify-center text-xl`}>
                  <span>{metric.icon}</span>
                </div>
                <span className="text-sm text-gray-600 font-medium">{metric.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-[#1a1a1a]">{metric.value}</h3>
              <p className="text-gray-600 text-sm">{metric.title}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Event Type Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Tickets by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sold" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events & Upcoming Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Recent Events Table */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Recent Events</h2>
                <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm text-gray-500">Event</th>
                        <th className="text-left py-3 text-sm text-gray-500">Date</th>
                        <th className="text-left py-3 text-sm text-gray-500">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {recentEvents.map((event) => (
                        <tr key={event.id} className="border-b border-gray-100">
                        <td className="py-3">
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="font-medium text-[#1a1a1a]">{event.title}</p>
                                    <p className="text-xs text-gray-500">{event.location}</p>
                                </div>
                            </div>
                        </td>
                        <td className="py-3 text-sm">{event.date}</td>
                        <td className="py-3">
                            <span className={getStatusBadge(event.date)}>{getStatusText(event.date)}</span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Upcoming Events List */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Upcoming Events</h2>
                <div className="space-y-4">
                    {upcomingEvents.length === 0 ? <p className="text-gray-500">No upcoming events.</p> : upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg">
                        <div className={`w-12 h-12 bg-gradient-to-br ${event.color} rounded-lg flex items-center justify-center text-white`}>
                            <span>{event.icon}</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-[#1a1a1a]">{event.title}</h3>
                            <p className="text-sm text-gray-600">{event.date}</p>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Recent Tickets Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Recent Ticket Sales</h2>
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm text-gray-500">Ticket ID</th>
                    <th className="text-left py-3 text-sm text-gray-500">Event</th>
                    <th className="text-left py-3 text-sm text-gray-500">Customer</th>
                    <th className="text-left py-3 text-sm text-gray-500">Price</th>
                </tr>
                </thead>
                <tbody>
                {recentTickets.map((ticket, index) => (
                    <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-[#1a1a1a]">{ticket.id}</td>
                    <td className="py-3 text-sm">{ticket.event}</td>
                    <td className="py-3 text-sm">{ticket.customer}</td>
                    <td className="py-3 text-sm">₹{ticket.price.toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;