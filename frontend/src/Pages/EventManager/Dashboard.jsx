import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const dashboardData = {
  metrics: {
    totalEvents: 24,
    ticketsSold: 1842,
    totalRevenue: 42580,
    totalAttendees: 1520,
  },
  revenueTrend: [
    { month: "May", revenue: 5200 },
    { month: "Jun", revenue: 7200 },
    { month: "Jul", revenue: 9100 },
    { month: "Aug", revenue: 8700 },
    { month: "Sep", revenue: 10300 },
    { month: "Oct", revenue: 12080 },
    { month: "Nov", revenue: 13500 },
  ],
  ticketBreakdown: [
    { event: "Puppy Training", sold: 200 },
    { event: "Agility Competition", sold: 150 },
    { event: "Feline Workshop", sold: 120 },
    { event: "First Aid Course", sold: 95 },
  ],
  upcomingEvents: [
    {
      id: 1,
      title: "Puppy Socialization Class",
      date: "Nov 15, 2024 • 10:00 AM",
      icon: "🐕",
      tickets: { sold: 45, total: 50 },
      status: "upcoming",
      color: "from-blue-400 to-blue-600",
    },
    {
      id: 2,
      title: "Advanced Obedience Training",
      date: "Nov 22, 2024 • 2:00 PM",
      icon: "🏃",
      tickets: { sold: 32, total: 40 },
      status: "upcoming",
      color: "from-green-400 to-green-600",
    },
    {
      id: 3,
      title: "Feline Behavior Workshop",
      date: "Dec 5, 2024 • 11:00 AM",
      icon: "🐱",
      tickets: { sold: 18, total: 30 },
      status: "upcoming",
      color: "from-purple-400 to-purple-600",
    },
  ],
  recentEvents: [
    {
      id: 1,
      title: "Puppy Training Workshop",
      location: "Central Park, NY",
      date: "Oct 20, 2024",
      icon: "🐕",
      tickets: { sold: 200, total: 200 },
      status: "completed",
      color: "from-blue-400 to-blue-600",
    },
    {
      id: 2,
      title: "Dog Agility Competition",
      location: "Brooklyn, NY",
      date: "Oct 12, 2024",
      icon: "🏃",
      tickets: { sold: 150, total: 150 },
      status: "completed",
      color: "from-green-400 to-green-600",
    },
    {
      id: 3,
      title: "Cat Adoption Fair",
      location: "Queens, NY",
      date: "Oct 5, 2024",
      icon: "🐱",
      tickets: { sold: 85, total: 100 },
      status: "completed",
      color: "from-purple-400 to-purple-600",
    },
  ],
  topSellingEvents: [
    {
      id: 1,
      title: "Puppy Training Workshop",
      ticketsSold: 200,
      revenue: 9000,
      icon: "🐕",
      color: "from-blue-400 to-blue-600",
    },
    {
      id: 2,
      title: "Dog Agility Competition",
      ticketsSold: 150,
      revenue: 7500,
      icon: "🏃",
      color: "from-green-400 to-green-600",
    },
    {
      id: 3,
      title: "Feline Behavior Workshop",
      ticketsSold: 120,
      revenue: 4800,
      icon: "🐱",
      color: "from-purple-400 to-purple-600",
    },
    {
      id: 4,
      title: "Pet First Aid Course",
      ticketsSold: 95,
      revenue: 3800,
      icon: "🩹",
      color: "from-yellow-400 to-yellow-600",
    },
  ],
  recentTickets: [
    {
      id: "TKT-1698512345",
      event: "Puppy Socialization Class",
      customer: "Sarah Johnson",
      purchaseDate: "Nov 10, 2024",
      price: 45.0,
      status: "active",
    },
    {
      id: "TKT-1698419876",
      event: "Advanced Obedience Training",
      customer: "Michael Brown",
      purchaseDate: "Nov 8, 2024",
      price: 60.0,
      status: "active",
    },
    {
      id: "TKT-1698324567",
      event: "Feline Behavior Workshop",
      customer: "Jennifer Lee",
      purchaseDate: "Nov 5, 2024",
      price: 40.0,
      status: "active",
    },
    {
      id: "TKT-1698213456",
      event: "Puppy Training Workshop",
      customer: "Robert Taylor",
      purchaseDate: "Oct 25, 2024",
      price: 45.0,
      status: "completed",
    },
  ],
};

const Dashboard = ({ setCurrentPage }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [metrics, setMetrics] = useState(dashboardData.metrics);
  const [upcomingEvents, setUpcomingEvents] = useState(
    dashboardData.upcomingEvents
  );
  const [recentEvents, setRecentEvents] = useState(dashboardData.recentEvents);
  const [topSellingEvents, setTopSellingEvents] = useState(
    dashboardData.topSellingEvents
  );
  const [recentTickets, setRecentTickets] = useState(
    dashboardData.recentTickets
  );
  const [revenueTrend, setRevenueTrend] = useState(dashboardData.revenueTrend);
  const [ticketBreakdown, setTicketBreakdown] = useState(
    dashboardData.ticketBreakdown
  );

  const getStatusBadge = (status) => {
    const baseClasses = "event-status-badge";
    switch (status) {
      case "upcoming":
        return `${baseClasses} event-status-upcoming`;
      case "completed":
        return `${baseClasses} event-status-completed`;
      case "active":
        return `${baseClasses} event-status-upcoming`;
      default:
        return `${baseClasses} event-status-upcoming`;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Completed";
      case "active":
        return "Active";
      default:
        return status;
    }
  };

  const handleCreateEvent = () => {
    console.log("Create event clicked");
    setCurrentPage("create-event"); 
  };
  const handleViewTicket = (ticketId) => console.log("View ticket:", ticketId);

  const metricCards = [
    {
      title: "Total Events",
      value: metrics.totalEvents,
      change: "+12%",
      icon: "📅",
      bgColor: "bg-blue-100",
    },
    {
      title: "Tickets Sold",
      value: metrics.ticketsSold.toLocaleString(),
      change: "+8%",
      icon: "🎫",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Revenue",
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      change: "+15%",
      icon: "💰",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total Attendees",
      value: metrics.totalAttendees.toLocaleString(),
      change: "+5%",
      icon: "👥",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              Event Manager Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Here's your event performance overview.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events, attendees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#effe8b]"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <button
              onClick={handleCreateEvent}
              className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 flex items-center gap-2"
            >
              <i className="fas fa-plus"></i>
              <span>Create Event</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {metricCards.map((metric, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 ${metric.bgColor} rounded-lg flex items-center justify-center text-xl`}
                >
                  <span>{metric.icon}</span>
                </div>
                <span className="text-sm text-green-600 font-medium">
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#1a1a1a]">
                {metric.value}
              </h3>
              <p className="text-gray-600 text-sm">{metric.title}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Line Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Revenue Overview</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1a1a1a"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Ticket Breakdown Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Tickets Sold by Event</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sold" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Upcoming Events */}
        </div>

        {/* Recent Events and Top Selling Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Events Table */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
              Recent Events
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">
                      Event
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">
                      Tickets
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="table-row border-b border-gray-100"
                    >
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${event.color} rounded-lg flex items-center justify-center text-white`}
                          >
                            <span className="emoji-icon">{event.icon}</span>
                          </div>
                          <div>
                            <p className="font-medium text-[#1a1a1a]">
                              {event.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {event.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm">{event.date}</td>
                      <td className="py-3 text-sm">
                        {event.tickets.sold}/{event.tickets.total}
                      </td>
                      <td className="py-3">
                        <span className={getStatusBadge(event.status)}>
                          {getStatusText(event.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <button className="text-sm text-blue-600 hover:underline">
                View All Events
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1a1a1a]">
                Upcoming Events
              </h2>
              <button className="text-sm text-blue-600 hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${event.color} rounded-lg flex items-center justify-center text-white`}
                  >
                    <span className="emoji-icon">{event.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1a1a1a]">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600">{event.date}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={getStatusBadge(event.status)}>
                        {getStatusText(event.status)}
                      </span>
                      <span className="text-sm font-medium">
                        {event.tickets.sold}/{event.tickets.total} tickets
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#1a1a1a]">
              Recent Ticket Sales
            </h2>
            <button className="text-sm text-blue-600 hover:underline">
              View All Tickets
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">
                    Ticket ID
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">
                    Event
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">
                    Customer
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">
                    Purchase Date
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">
                    Price
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket, index) => (
                  <tr
                    key={index}
                    className="table-row border-b border-gray-100"
                  >
                    <td className="py-3 text-sm font-medium text-[#1a1a1a]">
                      {ticket.id}
                    </td>
                    <td className="py-3 text-sm">{ticket.event}</td>
                    <td className="py-3 text-sm">{ticket.customer}</td>
                    <td className="py-3 text-sm">{ticket.purchaseDate}</td>
                    <td className="py-3 text-sm">${ticket.price.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={getStatusBadge(ticket.status)}>
                        {getStatusText(ticket.status)}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewTicket(ticket.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
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
