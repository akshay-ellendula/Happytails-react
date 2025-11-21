import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../utils/axios'; // Adjust path
import { Loader2, ArrowLeft } from 'lucide-react';

const TicketDetails = ({ setCurrentPage, ticketData }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      // If ticketData passed from list view has the DB ID, use it.
      // Note: The list view object has `.id` (database _id) and `.ticketId` (string ID)
      const idToFetch = ticketData?.id || ticketData?._id;
      
      if (!idToFetch) {
         setError("Invalid ticket reference");
         setLoading(false);
         return;
      }

      try {
        const res = await axiosInstance.get(`/tickets/${idToFetch}`);
        setTicket(res.data); // This is the raw Mongoose object with populated fields
        setLoading(false);
      } catch (err) {
        console.error("Error fetching ticket details:", err);
        setError("Ticket not found or access denied.");
        setLoading(false);
      }
    };

    fetchDetails();
  }, [ticketData]);

  // Delete/Cancel logic
  const handleCancelTicket = async () => {
    if (confirm("Are you sure you want to cancel this ticket? This will remove it permanently.")) {
      try {
        // Using standard DELETE method based on controller
        await axiosInstance.delete(`/tickets/${ticket._id}`);
        alert("Ticket cancelled successfully!");
        setCurrentPage("tickets");
      } catch (error) {
        alert('Failed to cancel ticket.');
      }
    }
  };

  const handleDownloadQR = () => {
    // Using the ticket ID as QR data
    const qrData = `TKT-${ticket._id.toString().slice(-10)}`;
    const link = document.createElement('a');
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
    link.download = `ticket-${ticket._id}-qrcode.png`;
    link.click();
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-10 h-10 text-gray-500"/></div>;
  
  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <h2 className="text-xl font-bold text-gray-700 mb-2">Ticket Not Found</h2>
        <button onClick={() => setCurrentPage("tickets")} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Back to Tickets</button>
      </div>
    );
  }

  // Mapping Backend Data to UI helpers
  const event = ticket.eventId || {};
  const customer = ticket.customerId || {};
  const ticketIdDisplay = `TKT-${ticket._id.slice(-10)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => setCurrentPage("tickets")} className="text-gray-700 hover:text-[#1a1a1a]">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="text-xl font-bold text-[#1a1a1a]">Ticket Details</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="text-center p-6 border-b border-gray-200 bg-gray-50">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl mx-auto mb-3">
              <i className="fas fa-ticket-alt"></i>
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Ticket Confirmation</h1>
            <p className="text-gray-600 text-sm font-mono">ID: {ticketIdDisplay}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="xl:col-span-2 space-y-6">
                {/* Event Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Event Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500">Event Name</label><p className="font-medium">{event.title}</p></div>
                    <div><label className="text-xs text-gray-500">Category</label><p className="font-medium">{event.category}</p></div>
                    <div><label className="text-xs text-gray-500">Date</label><p className="font-medium">{new Date(event.date_time).toLocaleString()}</p></div>
                    <div><label className="text-xs text-gray-500">Venue</label><p className="font-medium">{event.venue}</p></div>
                    <div><label className="text-xs text-gray-500">Location</label><p className="font-medium">{event.location}</p></div>
                    <div><label className="text-xs text-gray-500">Duration</label><p className="font-medium">{event.duration}</p></div>
                  </div>
                </div>

                {/* Customer & Pet Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Customer & Pet</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500">Customer Name</label><p className="font-medium">{customer.userName}</p></div>
                    <div><label className="text-xs text-gray-500">Email</label><p className="font-medium">{customer.email}</p></div>
                    <div><label className="text-xs text-gray-500">Phone</label><p className="font-medium">{customer.phoneNumber || 'N/A'}</p></div>
                    <div><label className="text-xs text-gray-500">Purchase Date</label><p className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p></div>
                    
                    <div className="md:col-span-2 mt-2 pt-2 border-t border-gray-200">
                       <p className="text-sm font-bold mb-2">Pet Info:</p>
                       <p className="text-sm">
                         Name: {ticket.petName || 'N/A'} | Breed: {ticket.petBreed || 'N/A'} | Age: {ticket.petAge || 'N/A'}
                       </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Status & Payment</h2>
                  <div className="flex justify-between items-center mb-4">
                     <div>
                        <p className="text-xs text-gray-500">Total Paid</p>
                        <p className="text-xl font-bold">${ticket.price}</p>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {ticket.status ? 'Active' : 'Cancelled'}
                     </span>
                  </div>
                  {ticket.status && (
                    <button onClick={handleCancelTicket} className="w-full py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                        Cancel / Delete Ticket
                    </button>
                  )}
                </div>

                {/* QR Code */}
                <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
                  <div className="bg-white p-2 rounded mb-3">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketIdDisplay}`}
                      alt="QR Code"
                      className="w-36 h-36"
                    />
                  </div>
                  <button onClick={handleDownloadQR} className="text-sm text-blue-600 hover:underline">
                    Download QR Code
                  </button>
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