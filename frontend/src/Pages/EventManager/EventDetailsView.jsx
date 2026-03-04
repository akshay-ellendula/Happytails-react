import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, DollarSign, Ticket, Calendar, 
  Loader2, MapPin, Clock, Info, Tag, Search 
} from 'lucide-react';
import { axiosInstance } from '../../utils/axios.js';

const EventDetailsView = ({ event, setCurrentPage }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state for search filter
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await axiosInstance.get(`/eventManagers/events/attendees/${event._id}`);
        setAttendees(res.data.attendees);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching attendees:", err);
        setError("Failed to load event attendees.");
        setLoading(false);
      }
    };

    if (event && event._id) {
      fetchAttendees();
    }
  }, [event]);

  // Calculations
  const ticketsSold = event?.tickets_sold || 0;
  const ticketPrice = event?.ticketPrice || 0;
  const grossRevenue = ticketsSold * ticketPrice;
  // Example tax calculation (Assuming 10% platform fee/tax, adjust as per your logic)
  const estimatedTaxesAndFees = grossRevenue * 0.06; 
  const netRevenue = grossRevenue - estimatedTaxesAndFees;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate > now 
      ? <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Upcoming</span>
      : <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">Completed</span>;
  };

  // Filter logic for attendees based on search term
  const filteredAttendees = attendees.filter(attendee => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = attendee.customerName?.toLowerCase().includes(searchLower);
    const emailMatch = attendee.customerEmail?.toLowerCase().includes(searchLower);
    const petMatch = attendee.petName?.toLowerCase().includes(searchLower);
    return nameMatch || emailMatch || petMatch;
  });

  if (!event) return <div>No event selected.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header Navigation */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setCurrentPage("events")}
          className="p-2 bg-white shadow-sm border border-gray-200 rounded-full hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Event Overview</h1>
          <p className="text-gray-500 text-sm">Detailed information and analytics</p>
        </div>
      </div>

      {/* Main Event Info Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Event Thumbnail */}
          <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-100 relative">
            {event?.images?.thumbnail ? (
              <img src={event.images.banner || event.images.thumbnail} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Calendar className="w-16 h-16 opacity-50" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
               {getStatusBadge(event.date_time)}
               <span className="px-3 py-1 bg-[#effe8b] text-[#1a1a1a] rounded-full text-xs font-bold shadow-sm">
                 {event.category || 'General'}
               </span>
            </div>
          </div>

          {/* Event Details */}
          <div className="w-full md:w-3/5 p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-4">{event.title}</h2>
            
            <p className="text-gray-600 mb-6 leading-relaxed flex items-start">
              <Info className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-1" />
              {event.description || "No description provided for this event."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              <div className="flex items-center text-gray-700">
                <Calendar className="w-5 h-5 mr-3 text-[#1a1a1a]" />
                <span className="font-medium">{formatDate(event.date_time)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-3 text-[#1a1a1a]" />
                <span className="font-medium">{event.location}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 mr-3 text-[#1a1a1a]" />
                <span className="font-medium">{event.duration || "N/A"}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Tag className="w-5 h-5 mr-3 text-[#1a1a1a]" />
                <span className="font-medium">Price: ₹{event.ticketPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tickets Sold</p>
              <h3 className="text-3xl font-bold text-gray-800">{ticketsSold} <span className="text-sm font-normal text-gray-400">/ {event.total_tickets}</span></h3>
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Ticket className="w-6 h-6" /></div>
          </div>
          <div className="mt-5 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(ticketsSold / event.total_tickets) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Gross Revenue</p>
              <h3 className="text-3xl font-bold text-gray-800">₹{grossRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-4 bg-green-50 text-green-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
          </div>
          <p className="text-sm text-gray-400 mt-3 font-medium">From {ticketsSold} sales</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Taxes & Fees (6%)</p>
              <h3 className="text-3xl font-bold text-red-500">-₹{estimatedTaxesAndFees.toFixed(2)}</h3>
            </div>
            <div className="p-4 bg-red-50 text-red-500 rounded-xl"><DollarSign className="w-6 h-6" /></div>
          </div>
          <p className="text-sm text-gray-400 mt-3 font-medium">Platform deductions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Net Earnings</p>
              <h3 className="text-3xl font-bold text-green-600">₹{netRevenue.toFixed(2)}</h3>
            </div>
            <div className="p-4 bg-[#effe8b]/30 text-green-700 rounded-xl"><DollarSign className="w-6 h-6" /></div>
          </div>
          <p className="text-sm text-gray-400 mt-3 font-medium">Available for payout</p>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        
        {/* Search and Filters Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" /> Attendee Roster
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search name, email, or pet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>

            {/* Total Guests Badge */}
            <span className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium w-full sm:w-auto text-center whitespace-nowrap">
              Total Guests: {attendees.reduce((acc, curr) => acc + curr.noOfTickets, 0)}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin w-8 h-8 text-gray-500" /></div>
        ) : error ? (
          <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="py-4 font-semibold px-2">Customer</th>
                  <th className="py-4 font-semibold px-2">Email</th>
                  <th className="py-4 font-semibold px-2 text-center">Tickets</th>
                  <th className="py-4 font-semibold px-2">Pet Details</th>
                  <th className="py-4 font-semibold px-2">Purchase Date</th>
                </tr>
              </thead>
              <tbody>
                {attendees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-500">No attendees have purchased tickets yet.</td>
                  </tr>
                ) : filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-500">
                      No attendees found matching "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((attendee, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 font-medium text-gray-800">{attendee.customerName || 'N/A'}</td>
                      <td className="py-4 px-2 text-gray-600">{attendee.customerEmail || 'N/A'}</td>
                      <td className="py-4 px-2 text-center">
                        <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-bold">
                          {attendee.noOfTickets}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        {attendee.petName ? (
                          <div className="text-sm">
                            <span className="font-bold text-gray-700">{attendee.petName}</span> 
                            <span className="text-gray-500 block text-xs mt-0.5">{attendee.petBreed} • {attendee.petAge} yrs</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">No pet info</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-500">{new Date(attendee.purchasedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsView;