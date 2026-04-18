import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Users, DollarSign, Ticket, Calendar,
  Loader2, MapPin, Clock, Info, Tag, Search,
  Star, Download, FileText, Image as ImageIcon
} from 'lucide-react';
import { axiosInstance } from '../../utils/axios.js';
import EventCard from '../Events/components/EventCard';

const EventDetailsView = ({ event, setCurrentPage }) => {
  const [attendees, setAttendees] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendeesRes, reviewsRes] = await Promise.allSettled([
          axiosInstance.get(`/eventManagers/events/attendees/${event._id}`),
          axiosInstance.get(`/review/event/${event._id}`)
        ]);

        if (attendeesRes.status === 'fulfilled') {
          setAttendees(attendeesRes.value.data.attendees || []);
        }
        if (reviewsRes.status === 'fulfilled') {
          setReviews(reviewsRes.value.data.reviews || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load some event data.");
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };

    if (event && event._id) {
      fetchData();
    }
  }, [event]);

  // Calculations
  const ticketsSold = event?.tickets_sold || 0;
  const ticketPrice = event?.ticketPrice || 0;
  const grossRevenue = ticketsSold * ticketPrice;
  const estimatedTaxesAndFees = grossRevenue * 0.06;
  const netRevenue = event?.isCancelled ? 0 : (grossRevenue - estimatedTaxesAndFees);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (event) => {
    if (event.isCancelled) {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Cancelled</span>;
    }
    const eventDate = new Date(event.date_time);
    const now = new Date();
    return eventDate > now
      ? <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Upcoming</span>
      : <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">Completed</span>;
  };

  const filteredAttendees = attendees.filter(attendee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      attendee.customerName?.toLowerCase().includes(searchLower) ||
      attendee.customerEmail?.toLowerCase().includes(searchLower) ||
      attendee.petName?.toLowerCase().includes(searchLower)
    );
  });

  // --- Download Helpers ---
  const downloadCSV = (data, filename, headers, rowFn) => {
    const csvContent = [
      headers.join(','),
      ...data.map(rowFn)
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDateForCSV = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${day}-${monthNames[d.getMonth()]}-${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const handleDownloadAttendeeReport = () => {
    downloadCSV(
      attendees,
      `${event.title.replace(/\s+/g, '_')}_attendees.csv`,
      ['Customer Name', 'Email', 'Tickets', 'Pet Name', 'Pet Breed', 'Pet Age', 'Purchase Date'],
      (a) => [
        `"${a.customerName || ''}"`,
        `"${a.customerEmail || ''}"`,
        a.noOfTickets || 0,
        `"${a.petName || ''}"`,
        `"${a.petBreed || ''}"`,
        a.petAge || '',
        `"${formatDateForCSV(a.purchasedAt)}"`
      ].join(',')
    );
  };

  const handleDownloadReviewsReport = () => {
    downloadCSV(
      reviews,
      `${event.title.replace(/\s+/g, '_')}_reviews.csv`,
      ['Reviewer', 'Email', 'Rating', 'Comment', 'Date'],
      (r) => [
        `"${r.customerId?.userName || r.customerId?.name || 'Anonymous'}"`,
        `"${r.customerId?.email || ''}"`,
        r.rating || 0,
        `"${(r.comment || '').replace(/"/g, "'")}"`,
        `"${formatDateForCSV(r.createdAt)}"`
      ].join(',')
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`}
      />
    ));
  };

  if (!event) return <div>No event selected.</div>;

  // Fix image — check all possible image fields
  const bannerImage = event.images?.banner || event.images?.thumbnail || event.banner || event.thumbnail || null;

  const previewEventData = {
    id: event._id,
    img: bannerImage || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop",
    title: event.title,
    date: new Date(event.date_time).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    venue: event.location,
    price: event.ticketPrice || 0,
    total_tickets: event.total_tickets || 100,
    tickets_sold: event.tickets_sold || 0,
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">

      {/* Header */}
      <div className="flex items-center justify-between">
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
      </div>

      {/* ─── Main Info + Preview ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: Banner Image + Details */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {/* Banner Image */}
          {bannerImage ? (
            <div className="relative w-full h-56 bg-gray-100">
              <img
                src={bannerImage}
                alt={event.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('hidden'); }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center gap-3 text-yellow-600">
              <ImageIcon className="w-10 h-10 opacity-50" />
              <span className="text-sm font-medium opacity-60">No banner image uploaded</span>
            </div>
          )}

          {/* Details */}
          <div className="p-8 flex flex-col flex-1 justify-center">
            <h2 className="text-3xl font-extrabold text-[#1a1a1a] mb-4">{event.title}</h2>
            <div className="flex gap-2 mb-6">
              {getStatusBadge(event)}
              <span className="px-3 py-1 bg-[#effe8b] text-[#1a1a1a] rounded-full text-xs font-bold shadow-sm">
                {event.category || 'General'}
              </span>
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed flex items-start">
              <Info className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-1" />
              {event.description || "No description provided for this event."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center text-gray-700">
                <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="font-semibold text-sm">{formatDate(event.date_time)}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <MapPin className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-semibold text-sm flex-1 truncate" title={event.location}>{event.location}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-semibold text-sm">{event.duration || "Duration TBA"}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Tag className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-semibold text-sm">Price: ₹{event.ticketPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Preview */}
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2 mb-4 px-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Live Public Preview</h3>
          </div>
          <div className="pointer-events-none shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-2xl border-4 border-gray-100">
            <EventCard event={previewEventData} />
          </div>
          <div className="mt-4 px-2">
            <button
              onClick={() => setCurrentPage("event-public-preview", event, "event")}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#effe8b] text-[#1a1a1a] rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:bg-[#e4fc54] transition-all font-black text-sm uppercase translate-y-[-2px] hover:translate-y-[0px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Search className="w-5 h-5" strokeWidth={2.5} />
              Preview Full Live Page
            </button>
            <p className="text-xs text-gray-500 mt-4 text-center font-medium px-4">
              View the detailed Event Page securely from within your dashboard!
            </p>
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

      {/* ─── Reviews Section ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Customer Reviews
              <span className="text-gray-400 font-normal text-base ml-1">({reviews.length})</span>
            </h2>
            {avgRating && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl font-black text-gray-800">{avgRating}</span>
                <div className="flex">{renderStars(parseFloat(avgRating))}</div>
                <span className="text-sm text-gray-500">average rating</span>
              </div>
            )}
          </div>
          <button
            onClick={handleDownloadReviewsReport}
            disabled={reviews.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl hover:bg-yellow-100 transition text-sm font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export Reviews CSV
          </button>
        </div>

        {reviewsLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-gray-500">No reviews yet</p>
            <p className="text-sm mt-1">Reviews will appear here once customers submit them.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                  {review.customerId?.profilePic ? (
                    <img src={review.customerId.profilePic} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (review.customerId?.userName || review.customerId?.name || 'A')[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {review.customerId?.userName || review.customerId?.name || 'Anonymous'}
                      </p>
                      {review.customerId?.email && (
                        <p className="text-xs text-gray-500">{review.customerId.email}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="text-xs text-gray-400">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  {(review.comment) && (
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" /> Attendee Roster
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
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
            <span className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium w-full sm:w-auto text-center whitespace-nowrap">
              Guests: {attendees.reduce((acc, curr) => acc + curr.noOfTickets, 0)}
            </span>
            <button
              onClick={handleDownloadAttendeeReport}
              disabled={attendees.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition text-sm font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Download List
            </button>
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
                    <td colSpan="5" className="py-10 text-center text-gray-500">No attendees found matching "{searchTerm}"</td>
                  </tr>
                ) : (
                  filteredAttendees.map((attendee, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-2 font-medium text-gray-800">{attendee.customerName || 'N/A'}</td>
                      <td className="py-4 px-2 text-gray-600">{attendee.customerEmail || 'N/A'}</td>
                      <td className="py-4 px-2 text-center">
                        <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-bold">{attendee.noOfTickets}</span>
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