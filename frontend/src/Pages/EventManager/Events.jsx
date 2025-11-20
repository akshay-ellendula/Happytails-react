import React, { useState, useEffect } from 'react';
import { Edit, BarChart3, Trash2, Search, Plus, Loader2 } from 'lucide-react';
import { axiosInstance } from '../../utils/axios.js'; // Adjust path as needed

const Events = ({ setCurrentPage }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Events on Mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Matches router.get('/events/my-events', ...) in eventManagerRoutes.js
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
        // Assumes a standard delete route exists
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
    setCurrentPage("edit-event", event);
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

  const getStatusBadge = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate > now ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const getStatusText = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate > now ? "Upcoming" : "Completed";
  };

  // Filter events based on search
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-gray-500" /></div>;
  if (error) return <div className="text-red-500 p-6 text-center">{error}</div>;

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">Events Management</h1>
            <p className="text-gray-600">Create and manage your events</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent"
              />
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            </div>
            <button 
              onClick={handleCreateEvent}
              className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1a1a1a]">All Events ({filteredEvents.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Event</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Location</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Stats</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4 text-gray-500">No events found.</td></tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event._id} className="table-row border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 bg-gray-100 rounded-lg overflow-hidden`}>
                             {/* Display image if available, else fallback */}
                             {event.thumbnail ? (
                               <img src={event.thumbnail} alt={event.title} className="w-full h-full object-cover" />
                             ) : (
                               <span className="flex items-center justify-center h-full">📅</span>
                             )}
                          </div>
                          <div>
                            <p className="font-medium text-[#1a1a1a]">{event.title}</p>
                            <p className="text-xs text-gray-500">{event.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm">
                        {formatDate(event.date_time)}
                        <br/><span className="text-gray-500">{event.duration}</span>
                      </td>
                      <td className="py-4 text-sm">{event.location}</td>
                      <td className="py-4 text-sm">
                        {/* Note: tickets_sold might not be in the standard list response unless aggregated */}
                        {event.tickets_sold || 0}/{event.total_tickets} Sold<br/>
                        <span className="font-medium text-gray-600">${event.ticketPrice}</span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.date_time)}`}>
                          {getStatusText(event.date_time)}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(event)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {/* Link to analytics page if you have one */}
                          <button className="text-green-600 hover:text-green-800 p-1" title="Analytics">
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(event._id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Events;