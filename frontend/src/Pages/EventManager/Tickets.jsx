import React, { useState, useEffect } from 'react';

const Tickets = ({ setCurrentPage }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("All Events");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [events, setEvents] = useState([]);

  // Fetch tickets and events on component mount
  useEffect(() => {
    fetchTickets();
    fetchEvents();
  }, []);

  // Mock API call to fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockTickets = [
          {
            id: "TKT-1698512345",
            eventId: "event-1",
            event: "Puppy Socialization Class",
            customer: "Sarah Johnson",
            email: "sarah@email.com",
            phone: "+1 (555) 123-4567",
            petDetails: {
              name: "Max",
              breed: "Golden Retriever",
              age: 6,
              ageUnit: "months"
            },
            purchaseDate: "2024-11-10",
            eventDate: "2024-11-15",
            price: 45.00,
            status: "Active",
            qrCode: "qr-code-12345"
          },
          {
            id: "TKT-1698419876",
            eventId: "event-2",
            event: "Advanced Obedience Training",
            customer: "Michael Brown",
            email: "michael@email.com",
            phone: "+1 (555) 987-6543",
            petDetails: {
              name: "Buddy",
              breed: "Labrador",
              age: 1,
              ageUnit: "year"
            },
            purchaseDate: "2024-11-08",
            eventDate: "2024-11-20",
            price: 60.00,
            status: "Active",
            qrCode: "qr-code-12346"
          },
          {
            id: "TKT-1698324567",
            eventId: "event-3",
            event: "Feline Behavior Workshop",
            customer: "Jennifer Lee",
            email: "jennifer@email.com",
            phone: "+1 (555) 456-7890",
            petDetails: {
              name: "Whiskers",
              breed: "Siamese",
              age: 2,
              ageUnit: "years"
            },
            purchaseDate: "2024-11-05",
            eventDate: "2024-11-18",
            price: 40.00,
            status: "Used",
            qrCode: "qr-code-12347"
          }
        ];
        setTickets(mockTickets);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    }
  };

  // Fetch available events for filter
  const fetchEvents = async () => {
    const mockEvents = [
      "Puppy Socialization Class",
      "Advanced Obedience Training",
      "Feline Behavior Workshop",
      "Dog Agility Competition",
      "Puppy Training Workshop"
    ];
    setEvents(mockEvents);
  };

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.petDetails.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEvent = eventFilter === "All Events" || ticket.event === eventFilter;
    const matchesStatus = statusFilter === "All Status" || ticket.status === statusFilter;
    
    return matchesSearch && matchesEvent && matchesStatus;
  });

  // View ticket details
  const handleViewTicket = (ticket) => {
    setCurrentPage("ticket-details", ticket, 'ticket');
  };

  // Edit ticket
  const handleEditTicket = (ticket) => {
    setCurrentPage("edit-ticket", ticket, 'ticket');
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format pet details for display
  const formatPetDetails = (pet) => {
    return `${pet.name} (${pet.breed}, ${pet.age} ${pet.ageUnit})`;
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Used':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1a1a1a]">
              All Tickets {filteredTickets.length > 0 && `(${filteredTickets.length})`}
            </h2>
            <div className="flex space-x-2">
              <select 
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All Events">All Events</option>
                {events.map(event => (
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
            <div className="text-center py-12">
              <i className="fas fa-ticket-alt text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg">No tickets found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || eventFilter !== "All Events" || statusFilter !== "All Status" 
                  ? "Try adjusting your search or filters" 
                  : "No tickets have been purchased yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Ticket ID</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Event</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Pet Details</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Purchase Date</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 text-sm font-medium text-[#1a1a1a]">{ticket.id}</td>
                      <td className="py-4 text-sm">{ticket.event}</td>
                      <td className="py-4 text-sm">
                        <div className="font-medium">{ticket.customer}</div>
                        <div className="text-gray-500 text-xs">{ticket.email}</div>
                        <div className="text-gray-400 text-xs">{ticket.phone}</div>
                      </td>
                      <td className="py-4 text-sm">{formatPetDetails(ticket.petDetails)}</td>
                      <td className="py-4 text-sm">{formatDate(ticket.purchaseDate)}</td>
                      <td className="py-4 text-sm font-medium">${ticket.price.toFixed(2)}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewTicket(ticket)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                          >
                            view
                          </button>
                          <button 
                            onClick={() => handleEditTicket(ticket)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Edit Ticket"
                          >
                           edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Tickets;