import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../utils/axios'; // Adjust path
import { Loader2, Eye, Edit } from 'lucide-react';

const Tickets = ({ setCurrentPage }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [eventFilter, setEventFilter] = useState("All Events");
  const [uniqueEvents, setUniqueEvents] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Corresponds to router.get('/') in ticketRouter which uses getEventManagerTickets
        const res = await axiosInstance.get('/tickets'); 
        setTickets(res.data);
        
        // Extract unique event names for the filter dropdown
        const events = [...new Set(res.data.map(t => t.eventName))];
        setUniqueEvents(events);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Filter Logic
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.customerEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.eventName || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEvent = eventFilter === "All Events" || ticket.eventName === eventFilter;
    const matchesStatus = statusFilter === "All Status" || ticket.status === statusFilter.toLowerCase();
    
    return matchesSearch && matchesEvent && matchesStatus;
  });

  const handleViewTicket = (ticket) => {
    // Use the database ID (ticket.id) to fetch details, pass entire object for immediate rendering
    setCurrentPage("ticket-details", ticket);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-gray-500"/></div>;

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-[#1a1a1a]">
            All Tickets {filteredTickets.length > 0 && `(${filteredTickets.length})`}
          </h2>
          
          {/* Search & Filters */}
          <div className="flex flex-wrap gap-2">
            <input 
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#effe8b]"
            />
            <select 
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Events">All Events</option>
              {uniqueEvents.map(event => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Used">Used</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No tickets found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Ticket ID</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Event</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Pet Info</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Purchased</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 text-sm font-medium text-[#1a1a1a]">{ticket.ticketId}</td>
                    <td className="py-4 text-sm">{ticket.eventName}</td>
                    <td className="py-4 text-sm">
                      <div className="font-medium">{ticket.customerName || 'Guest'}</div>
                      <div className="text-gray-500 text-xs">{ticket.customerEmail}</div>
                    </td>
                    <td className="py-4 text-sm text-gray-600">{ticket.petDetails}</td>
                    <td className="py-4 text-sm">{formatDate(ticket.purchaseDate)}</td>
                    <td className="py-4 text-sm font-medium">${ticket.price}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button 
                        onClick={() => handleViewTicket(ticket)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;