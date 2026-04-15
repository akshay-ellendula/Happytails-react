import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Search, Plus, Loader2, Eye, ArrowUpDown, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { axiosInstance } from '../../utils/axios.js';

const Events = ({ setCurrentPage }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("none"); // "none", "desc", "asc"

  // Fetch Events on Mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get('/eventManagers/events/my-events');
        setEvents(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events.");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axiosInstance.delete(`/events/${eventId}`);
        setEvents(events.filter((event) => event._id !== eventId));
        alert("Event deleted successfully");
      } catch (err) {
        console.error("Error deleting event:", err);
        alert("Failed to delete event");
      }
    }
  };

  const handleEdit = (event) => {
    setCurrentPage("edit-event", event, "event");
  };

  const handleView = (event) => {
    setCurrentPage("event-details", event, "event");
  };

  const handleCreateEvent = () => {
    setCurrentPage("create-event");
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusBadge = (event) => {
    if (event.isCancelled) return "bg-red-100 text-red-800 border border-red-200";
    const eventDate = new Date(event.date_time);
    const now = new Date();
    return eventDate > now 
      ? "bg-green-100 text-green-800 border border-green-200" 
      : "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getStatusText = (event) => {
    if (event.isCancelled) return "Cancelled";
    const eventDate = new Date(event.date_time);
    const now = new Date();
    return eventDate > now ? "Upcoming" : "Completed";
  };

  // Helper to calculate Net Revenue (after 6% tax)
  const calculateNetRevenue = (event) => {
    if (event.isCancelled) return 0;
    const sold = event.tickets_sold || 0;
    const price = event.ticketPrice || 0;
    const grossRevenue = sold * price;
    return grossRevenue * 0.94; // Deducting 6% tax
  };

  // Filter and Sort Logic
  const processedEvents = events
    .filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.category && event.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === "none") return 0;
      const revenueA = calculateNetRevenue(a);
      const revenueB = calculateNetRevenue(b);
      return sortOrder === "desc" ? revenueB - revenueA : revenueA - revenueB;
    });

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-gray-500" /></div>;
  if (error) return <div className="text-red-500 p-6 text-center bg-red-50 rounded-lg m-6">{error}</div>;

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <header className="bg-white shadow-sm border-b border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Events Management</h1>
            <p className="text-gray-500 text-sm mt-1">Create, manage, and analyze your events</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-64 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm transition-shadow"
              />
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            </div>

            {/* Sorting Dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent appearance-none bg-white text-sm text-gray-700 font-medium cursor-pointer transition-shadow"
              >
                <option value="none">Sort by Revenue</option>
                <option value="desc">Highest Revenue</option>
                <option value="asc">Lowest Revenue</option>
              </select>
              <ArrowUpDown className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateEvent}
              className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 flex-1 overflow-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
            <h2 className="text-lg font-bold text-[#1a1a1a]">All Events <span className="text-gray-400 text-sm font-normal ml-2">({processedEvents.length} total)</span></h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Event Info</th>
                  <th className="px-6 py-4 font-semibold">Date & Location</th>
                  <th className="px-6 py-4 font-semibold">Sales</th>
                  <th className="px-6 py-4 font-semibold">Net Revenue (Est.)</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processedEvents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center text-gray-400">
                        <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-base font-medium text-gray-600">No events found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or create a new event.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedEvents.map((event) => {
                    const netRevenue = calculateNetRevenue(event);
                    return (
                      <tr key={event._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                              {event.images?.thumbnail || event.thumbnail ? (
                                <img src={event.images?.thumbnail || event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-xl">📅</div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[#1a1a1a] text-sm truncate max-w-[200px]" title={event.title}>{event.title}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                {event.category || 'General'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-800">{formatDate(event.date_time)}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]" title={event.location}>{event.location}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${((event.tickets_sold || 0) / (event.total_tickets || 1)) * 100}%` }}></div>
                            </div>
                            <span className="text-sm font-bold text-gray-700">{event.tickets_sold || 0}<span className="text-gray-400 font-normal">/{event.total_tickets}</span></span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">₹{event.ticketPrice} / ticket</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-green-700">₹{netRevenue.toFixed(2)}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">After 6% platform tax</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(event)}`}>
                            {getStatusText(event)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => handleView(event)}
                              className="p-2 text-gray-500 hover:text-[#1a1a1a] hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Analytics & Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!event.isCancelled && (
                              <>
                                <button
                                  onClick={() => handleEdit(event)}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Event"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(event._id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Event"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;