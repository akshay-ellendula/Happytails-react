// src/Pages/Admin/EventDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEventDetails,
  fetchEventAttendees,
  updateEvent,
  deleteEvent,
  clearSelectedEvent,
} from "../../store/eventsSlice";
import { Loader2, X } from "lucide-react";

/* ----------------- Edit Modal ----------------- */
const EditModal = ({ isOpen, onClose, event, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    venue: "",
    location: "", // City
    phoneNumber: "", // Contact
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
        phoneNumber: event.contact_number || "", // Map contact_number to phoneNumber
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Edit Event Basic Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Manager (Read-Only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <input
              type="text"
              value={event?.eventManagerId?.userName || "N/A"}
              disabled
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Venue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <hr className="my-4" />
          <h3 className="text-lg font-semibold text-gray-700">Other Details</h3>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                name="date_time"
                value={formData.date_time}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Ticket Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (₹)</label>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            {/* Total Tickets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Tickets</label>
              <input
                type="number"
                name="total_tickets"
                value={formData.total_tickets}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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

  // Fetch data on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchEventDetails(id));
      dispatch(fetchEventAttendees(id));
    }
    return () => dispatch(clearSelectedEvent());
  }, [dispatch, id]);

  // SAFE CALCULATIONS
  const ticketsSold = Number(event?.tickets_sold) || 0;
  const ticketPrice = Number(event?.ticketPrice) || 0;
  const totalTickets = Number(event?.total_tickets) || 0;

  const revenue = ticketPrice > 0
    ? (ticketsSold * ticketPrice * 0.94).toFixed(2)
    : "0.00";

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

    // Note: Image upload is not included in this basic edit modal as per request, 
    // but existing images are preserved by backend logic if not provided.

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

  // Loading & Error States
  if (loadingDetail || loadingAttendees) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 text-xl mb-4">Error: {error}</p>
        <button onClick={() => navigate("/admin/events")} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Back to Events
        </button>
      </div>
    );
  }

  if (!event) return <div className="p-10 text-center text-2xl">Event not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100 min-h-screen font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate("/admin/events")} className="bg-green-500 text-white px-4 py-2 rounded">
          ← Back to Events
        </button>
        <div className="space-x-3">
          <button onClick={() => setIsEditModalOpen(true)} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Edit Event
          </button>
          <button onClick={handleDelete} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Delete Event
          </button>
        </div>
      </div>

      {/* Event Header */}
      <div className="bg-white rounded-lg shadow p-8 mb-6 flex items-start gap-6">
        <img
          src={event.images?.thumbnail || "https://via.placeholder.com/150"}
          alt={event.title}
          className="w-40 h-40 object-cover rounded-lg"
        />
        <div>
          <h1 className="text-3xl font-bold mb-3">{event.title}</h1>
          <p className="text-gray-600 text-lg">
            {event.date_time ? new Date(event.date_time).toLocaleString() : "No date"}
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold text-[#6495ed] mb-4 border-b pb-3">Basic Information</h3>
        <table className="w-full text-left">
          <tbody className="divide-y">
            <tr><td className="font-medium py-2 w-1/3">Event ID:</td><td>#{event.id}</td></tr>
            <tr><td className="font-medium py-2">Manager:</td><td>{event.eventManagerId?.userName || "N/A"}</td></tr>
            <tr><td className="font-medium py-2">Category:</td><td>{event.category || "N/A"}</td></tr>
            <tr><td className="font-medium py-2">Venue:</td><td>{event.venue || "N/A"}</td></tr>
            <tr><td className="font-medium py-2">City:</td><td>{event.location || "N/A"}</td></tr>
            <tr><td className="font-medium py-2">Contact:</td><td>{event.contact_number || "N/A"}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Event Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold text-[#6495ed] mb-4 border-b pb-3">Event Details</h3>
        <table className="w-full text-left">
          <tbody className="divide-y">
            <tr><td className="font-medium py-2 w-1/3">Language:</td><td>{event.language || "N/A"}</td></tr>
            <tr><td className="font-medium py-2">Duration:</td><td>{event.duration || "N/A"}</td></tr>
            <tr><td className="font-medium py-2">Ticket Price:</td><td>₹{ticketPrice.toFixed(2)}</td></tr>
            <tr><td className="font-medium py-2">Age Limit:</td><td>{event.ageLimit || "N/A"}</td></tr>
            <tr><td className="font-medium py-2">Total Tickets:</td><td>{totalTickets}</td></tr>
            <tr><td className="font-medium py-2">Tickets Sold:</td><td>{ticketsSold}</td></tr>
            <tr><td className="font-medium py-2 text-green-600 font-bold">Revenue Collected:</td><td className="text-green-600 font-bold">₹{revenue}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Description & Instructions */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-[#6495ed] mb-4 border-b pb-3">Description</h3>
          <p className="text-gray-700 leading-relaxed">{event.description || "No description"}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-[#6495ed] mb-4 border-b pb-3">Instructions</h3>
          <p className="text-gray-700 leading-relaxed">{event.instructions || "No instructions"}</p>
        </div>
      </div>

      {/* Attendees */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-[#6495ed] mb-4 border-b pb-3">Attendees ({attendees.length})</h3>
        {attendees.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tickets sold yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left text-sm">
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Tickets</th>
                  <th className="p-3">Pet?</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((a) => (
                  <tr key={a.ticketId} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">{a.ticketId}</td>
                    <td className="p-3">{a.customerName || "N/A"}</td>
                    <td className="p-3 text-sm">{a.customerEmail}</td>
                    <td className="p-3 text-center">{a.numberOfTickets}</td>
                    <td className="p-3 text-center">{a.petName ? "Yes" : "No"}</td>
                    <td className="p-3 text-sm">{new Date(a.purchaseDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={event}
        onSave={handleUpdate}
      />
    </div>
  );
};

export default EventDetails;