import { useState, useEffect } from 'react';

const TicketDetails = ({ setCurrentPage, ticketData }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (ticketData) {
      setTicket(ticketData);
      setLoading(false);
    } else {
      fetchTicketDetails();
    }
  }, [ticketData]);

  // Mock API call to fetch ticket details
  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockTicket = {
          id: "TKT-1698512345",
          event: {
            name: "Puppy Socialization Class",
            date: "2024-11-15T10:00:00",
            venue: "Central Park, NY",
            duration: "4 hours",
            instructor: "Dr. Sarah Wilson",
            maxParticipants: 20
          },
          customer: {
            name: "Sarah Johnson",
            email: "sarah@email.com",
            phone: "+1 (555) 123-4567",
            address: "123 Main St, New York, NY"
          },
          purchaseDate: "2024-11-10",
          price: 45.00,
          status: "Active",
          qrCode: "qr-code-12345",
          pet: {
            name: "Max",
            breed: "Golden Retriever",
            age: 6,
            ageUnit: "months",
            weight: "25 lbs",
            specialNeeds: "None"
          },
          checkInTime: null,
          seatNumber: "A-12"
        };
        setTicket(mockTicket);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      setLoading(false);
    }
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // Resend ticket functionality
  const handleResendTicket = async () => {
    setIsResending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Ticket has been resent to ${ticket.customer.email}`);
    } catch (error) {
      alert('Failed to resend ticket. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Cancel ticket functionality
  const handleCancelTicket = async () => {
    if (confirm("Are you sure you want to cancel this ticket? This action cannot be undone.")) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTicket(prev => ({ ...prev, status: "Cancelled" }));
        alert("Ticket has been cancelled successfully!");
      } catch (error) {
        alert('Failed to cancel ticket. Please try again.');
      }
    }
  };

  // Download QR code functionality
  const handleDownloadQR = () => {
    // In a real app, this would generate and download the QR code
    const link = document.createElement('a');
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.qrCode}`;
    link.download = `ticket-${ticket.id}-qrcode.png`;
    link.click();
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  console.log(ticket)
  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-ticket-alt text-4xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Ticket Not Found</h2>
          <p className="text-gray-500 mb-4">The ticket you're looking for doesn't exist.</p>
          <button 
            onClick={() => setCurrentPage("tickets")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage("tickets")}
                className="text-2xl text-gray-700 hover:text-[#1a1a1a]"
              >
                ←
              </button>
              <div className="text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
                🐾 Happy Tails
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm">
          {/* Ticket Header */}
          <div className="text-center p-6 border-b border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xl mx-auto mb-3">
              <i className="fas fa-ticket-alt"></i>
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">
              Ticket Confirmation
            </h1>
            <p className="text-gray-600 text-sm">
              Ticket ID: <span className="font-mono font-bold">{ticket.id}</span>
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Event & Customer Details */}
              <div className="xl:col-span-2 space-y-6">
                {/* Event Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
                    Event Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Event:</label>
                      <p className="font-medium text-sm">{ticket.event.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Date & Time:</label>
                      <p className="font-medium text-sm">
                        {formatDate(ticket.event.date)} • {formatTime(ticket.event.date)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Venue:</label>
                      <p className="font-medium text-sm">{ticket.event.venue}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Duration:</label>
                      <p className="font-medium text-sm">{ticket.event.duration}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Instructor:</label>
                      <p className="font-medium text-sm">{ticket.event.instructor}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Seat Number:</label>
                      <p className="font-medium text-sm">{ticket.seatNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
                    Customer Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name:</label>
                      <p className="font-medium text-sm">{ticket.customer.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email:</label>
                      <p className="font-medium text-sm">{ticket.customer.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phone:</label>
                      <p className="font-medium text-sm">{ticket.customer.phone}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Date:</label>
                      <p className="font-medium text-sm">{formatDate(ticket.purchaseDate)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Address:</label>
                      <p className="font-medium text-sm">{ticket.customer.address}</p>
                    </div>
                  </div>
                </div>

                {/* Pet Information */}
                { ticket.pet && (
                   <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
                    Pet Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Pet Name:</label>
                      <p className="font-medium text-sm">{ticket.pet.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Breed:</label>
                      <p className="font-medium text-sm">{ticket.pet.breed}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Age:</label>
                      <p className="font-medium text-sm">{ticket.pet.age}</p>
                    </div>
                  </div>
                </div>
                )

               }
              </div>

              {/* Right Column - QR Code & Actions */}
              <div className="space-y-6">
                {/* Ticket Status & Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
                    Ticket Status
                  </h2>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-xs text-gray-600">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : ticket.status === 'Used'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Price:</span>
                        <span className="ml-2 font-bold text-base">${ticket.price.toFixed(2)}</span>
                      </div>
                    </div>
                    {ticket.status === 'Active' && (
                      <button
                        onClick={handleCancelTicket}
                        className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition"
                      >
                        <i className="fas fa-times mr-1"></i>Cancel Ticket
                      </button>
                    )}
                  </div>
                  {ticket.checkInTime && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Checked In:</label>
                      <p className="font-medium text-sm">
                        {formatDate(ticket.checkInTime)} • {formatTime(ticket.checkInTime)}
                      </p>
                    </div>
                  )}
                </div>

                {/* QR Code */}
                <div className="bg-gray-100 rounded-lg p-4 flex flex-col">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-4 text-center">
                    Check-in QR Code
                  </h2>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-4">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.qrCode}`}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-xs text-gray-600 text-center max-w-xs mb-4">
                      Scan this code at the event entrance for check-in
                    </p>
                    <button
                      onClick={handleDownloadQR}
                      className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <i className="fas fa-download mr-2"></i>Download QR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;