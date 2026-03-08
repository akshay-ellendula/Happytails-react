import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import Loader from "./Components/Loader";
import {
  fetchEventDetails,
  fetchEventAttendees,
  updateEvent,
  deleteEvent,
  clearSelectedEvent,
} from "../../store/eventsSlice";
import "./admin-styles.css";

/* ----------------- Edit Modal ----------------- */
const EditModal = ({ isOpen, onClose, event, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    venue: "",
    location: "",
    phoneNumber: "",
    date_time: "",
    ticketPrice: 0,
    total_tickets: 0,
    description: "",
    instructions: "",
    language: "",
    duration: "",
    ageLimit: "",
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        category: event.category || "",
        venue: event.venue || "",
        location: event.location || "",
        phoneNumber: event.contact_number || "",
        date_time: event.date_time ? new Date(event.date_time).toISOString().slice(0, 16) : "",
        ticketPrice: event.ticketPrice || 0,
        total_tickets: event.total_tickets || 0,
        description: event.description || "",
        instructions: event.instructions || "",
        language: event.language || "",
        duration: event.duration || "",
        ageLimit: event.ageLimit || "",
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Edit Event Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <input
              type="text"
              value={event?.eventManagerId?.userName || "N/A"}
              disabled
              className="w-full border-2 border-gray-200 p-3 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
              />
            </div>
          </div>

          <hr className="my-4 border-gray-200" />
          
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Other Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                name="date_time"
                value={formData.date_time}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (₹)</label>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Tickets</label>
              <input
                type="number"
                name="total_tickets"
                value={formData.total_tickets}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all duration-300"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    selected: event,
    attendees,
    loadingDetail,
    loadingAttendees,
    error,
  } = useSelector((state) => state.events);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchEventDetails(id));
      dispatch(fetchEventAttendees(id));
    }
    return () => dispatch(clearSelectedEvent());
  }, [dispatch, id]);

  const ticketsSold = Number(event?.tickets_sold) || 0;
  const ticketPrice = Number(event?.ticketPrice) || 0;
  const totalTickets = Number(event?.total_tickets) || 0;
  const revenue = ticketPrice > 0 ? (ticketsSold * ticketPrice * 0.94).toFixed(2) : "0.00";

  const handleUpdate = async (formData) => {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("language", formData.language);
    data.append("duration", formData.duration);
    data.append("ticketPrice", formData.ticketPrice);
    data.append("ageLimit", formData.ageLimit);
    data.append("venue", formData.venue);
    data.append("category", formData.category);
    data.append("date_time", new Date(formData.date_time).toISOString());
    data.append("total_tickets", formData.total_tickets);
    data.append("location", formData.location);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("instructions", formData.instructions);

    const result = await dispatch(updateEvent({ id, formData: data }));
    if (updateEvent.fulfilled.match(result)) {
      alert("Event updated successfully!");
      setIsEditModalOpen(false);
      dispatch(fetchEventDetails(id));
    } else {
      alert(result.payload || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this event and all tickets? This cannot be undone!")) return;
    const result = await dispatch(deleteEvent(id));
    if (deleteEvent.fulfilled.match(result)) {
      alert("Event deleted!");
      navigate("/admin/events");
    } else {
      alert(result.payload || "Delete failed");
    }
  };

  if (loadingDetail || loadingAttendees) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Event Details" />
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Loader />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Event Details" />
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Event</h2>
              <p className="text-gray-600 mb-6">Error: {error}</p>
              <button
                onClick={() => navigate("/admin/events")}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Event Details" />
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Event Not Found</h2>
              <p className="text-gray-600 mb-6">The event could not be found.</p>
              <button
                onClick={() => navigate("/admin/events")}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Back to Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const eventCode = `#EV${String(event.id).slice(-3).padStart(3, "0")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <Header title="Event Details" />
        
        <main className="p-6">
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/admin/events")}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-5 py-2.5 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Events
            </button>
          </div>

          {/* Event Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <img
                  src={event.images?.thumbnail || "https://via.placeholder.com/150"}
                  alt={event.title}
                  className="h-24 w-24 rounded-xl object-cover shadow-lg"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h1>
                  <p className="text-gray-600">
                    {event.date_time ? new Date(event.date_time).toLocaleString() : "No date"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Edit Event
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>

          {/* Event Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">Tickets Sold</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{ticketsSold}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl">
                  🎫
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">Available Tickets</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{totalTickets - ticketsSold}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                  📊
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">Total Revenue</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">₹{revenue}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-xl">
                  💰
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm text-gray-600 uppercase tracking-wider">Ticket Price</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">₹{ticketPrice.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  📈
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Event ID</p>
                  <p className="text-lg font-semibold text-gray-800">{eventCode}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Manager</p>
                  <p className="text-lg font-semibold text-gray-800">{event.eventManagerId?.userName || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="text-lg font-semibold text-gray-800">{event.category || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Venue</p>
                  <p className="text-lg font-semibold text-gray-800">{event.venue || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">City</p>
                  <p className="text-lg font-semibold text-gray-800">{event.location || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Contact</p>
                  <p className="text-lg font-semibold text-gray-800">{event.contact_number || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Language</p>
                  <p className="text-lg font-semibold text-gray-800">{event.language || "N/A"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">Age Limit</p>
                  <p className="text-lg font-semibold text-gray-800">{event.ageLimit || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Event Details</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {event.description || "No description available"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Instructions</p>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {event.instructions || "No instructions available"}
                </p>
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Attendees</h3>
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                {attendees.length} {attendees.length === 1 ? 'Attendee' : 'Attendees'}
              </span>
            </div>
            
            {attendees.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <p className="text-gray-600">No tickets sold yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 text-left font-semibold text-gray-700">Ticket ID</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Customer</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Tickets</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Pet?</th>
                      <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((a) => (
                      <tr key={a.id || a.ticketId} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-sm">{a.id || a.ticketId || "N/A"}</td>
                        <td className="p-3 font-semibold">{a.customer?.name || a.customerName || a.name || "N/A"}</td>
                        <td className="p-3 text-sm text-gray-600">{a.customer?.email || a.customerEmail || a.email || "N/A"}</td>
                        <td className="p-3 text-center">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {a.number_of_tickets || a.numberOfTickets || a.tickets || "0"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${(a.pet?.name || a.petName) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {(a.pet?.name || a.petName) ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-gray-500">
                          {new Date(a.purchase_date || a.purchaseDate || a.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          event={event}
          onSave={handleUpdate}
        />
      </div>
    </div>
  );
};

export default EventDetails;