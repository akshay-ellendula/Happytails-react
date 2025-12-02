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
import { Loader2 } from "lucide-react";

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

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    language: "",
    duration: "",
    ticketPrice: 0,
    ageLimit: "",
    venue: "",
    category: "",
    dateTime: "",
    totalTickets: 0,
    city: "",
    contactNumber: "",
    instructions: "",
    terms: "",
    thumbnail: null,
    banner: null,
  });

  // Fetch data on mount
  useEffect(() => {
    if (id) {
      dispatch(fetchEventDetails(id));
      dispatch(fetchEventAttendees(id));
    }
    return () => dispatch(clearSelectedEvent());
  }, [dispatch, id]);

  // Populate form when event loads
  useEffect(() => {
    if (event) {
      const dateTimeLocal = event.date_time
        ? new Date(event.date_time).toISOString().slice(0, 16)
        : "";
      setFormData({
        name: event.title || "",
        about: event.description || "",
        language: event.language || "",
        duration: event.duration || "",
        ticketPrice: event.ticketPrice || 0,
        ageLimit: event.ageLimit || "",
        venue: event.venue || "",
        category: event.category || "",
        dateTime: dateTimeLocal,
        totalTickets: event.total_tickets || 0,
        city: event.location || "",
        contactNumber: event.contact_number || "",
        instructions: event.instructions || "",
        terms: event.terms || "",
        thumbnail: null,
        banner: null,
      });
    }
  }, [event]);

  // SAFE CALCULATIONS – NO MORE CRASHES
  const ticketsSold = Number(event?.tickets_sold) || 0;
  const ticketPrice = Number(event?.ticketPrice) || 0;
  const totalTickets = Number(event?.total_tickets) || 0;

  const revenue = ticketPrice > 0
    ? (ticketsSold * ticketPrice * 0.94).toFixed(2)
    : "0.00";

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.name);
    data.append("description", formData.about);
    data.append("language", formData.language);
    data.append("duration", formData.duration);
    data.append("ticketPrice", formData.ticketPrice);
    data.append("ageLimit", formData.ageLimit);
    data.append("venue", formData.venue);
    data.append("category", formData.category);
    data.append("date_time", new Date(formData.dateTime).toISOString());
    data.append("total_tickets", formData.totalTickets);
    data.append("location", formData.city);
    data.append("contact_number", formData.contactNumber);
    data.append("instructions", formData.instructions);
    data.append("terms", formData.terms);
    if (formData.thumbnail) data.append("thumbnail", formData.thumbnail);
    if (formData.banner) data.append("banner", formData.banner);

    const result = await dispatch(updateEvent({ id, formData: data }));
    if (updateEvent.fulfilled.match(result)) {
      alert("Event updated successfully!");
      setIsEditing(false);
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

  // Edit Mode
  if (isEditing) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-gray-100 min-h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#6495ed] mb-6">Edit Event</h2>
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Your existing form fields here */}
            <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700">
              Save Changes
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 ml-4">
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // View Mode
  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-100 min-h-screen font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate("/admin/events")} className="text-blue-600 hover:underline text-lg">
          ← Back to Events
        </button>
        <div className="space-x-3">
          <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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
    </div>
  );
};

export default EventDetails;