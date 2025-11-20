import React, { useState } from "react";
import { axiosInstance } from '../../utils/axios.js'; // Adjust path
import { Loader2 } from "lucide-react";

const CreateEvent = ({ setCurrentPage }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    language: "English",
    date_time: "",
    duration: "",
    venue: "",
    location: "",
    total_tickets: "",
    ticketPrice: "",
    ageLimit: "",
    thumbnail: null,
    banner: null,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (name === "thumbnail") setThumbnailPreview(previewUrl);
      else if (name === "banner") setBannerPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Create FormData object for multipart/form-data
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      // Assumes generic POST /api/events endpoint
      const response = await axiosInstance.post('/events', data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201 || response.status === 200) {
        alert("Event created successfully!");
        setCurrentPage("events");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert(error.response?.data?.message || "Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentPage("events");
  };

  return (
    <div className="mx-auto py-4 px-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a1a]">Create New Event</h1>
            <p className="text-gray-600 text-sm">Fill in the event details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Enter event title"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">Select Category</option>
                  <option value="training">Training</option>
                  <option value="competition">Competition</option>
                  <option value="workshop">Workshop</option>
                  <option value="adoption">Adoption Event</option>
                  <option value="social">Social Gathering</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Language *</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="border-b border-gray-200 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Event Date & Time *</label>
                <input
                  type="datetime-local"
                  name="date_time"
                  value={formData.date_time}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration *</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="e.g., 4 hours"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="border-b border-gray-200 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Tickets & Pricing */}
          <div className="border-b border-gray-200 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Total Tickets *</label>
                <input
                  type="number"
                  name="total_tickets"
                  value={formData.total_tickets}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ticket Price (₹) *</label>
                <input
                  type="number"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Age Limit *</label>
                <input
                  type="text"
                  name="ageLimit"
                  value={formData.ageLimit}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Event Images */}
          <div className="pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Thumbnail Image *</label>
                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                {thumbnailPreview && <img src={thumbnailPreview} alt="Preview" className="mt-2 h-20 rounded" />}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Banner Image *</label>
                <input
                  type="file"
                  name="banner"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                 {bannerPreview && <img src={bannerPreview} alt="Preview" className="mt-2 h-20 rounded" />}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1a1a1a] text-white rounded text-sm font-medium hover:bg-opacity-90 flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;