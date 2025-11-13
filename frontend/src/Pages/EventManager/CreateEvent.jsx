import React, { useState } from "react";

const CreateEvent = ({ setCurrentPage }) => {
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

    // Create preview URL
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (name === "thumbnail") {
        setThumbnailPreview(previewUrl);
      } else if (name === "banner") {
        setBannerPreview(previewUrl);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // Here you would typically send the data to your backend
    alert("Event created successfully!");

    // Redirect back to events page after creation
    setCurrentPage("events");

    // Reset form
    setFormData({
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
    setThumbnailPreview(null);
    setBannerPreview(null);
  };

  const handleCancel = () => {
    setCurrentPage("events"); // Redirect back to events page
  };

  return (
    <div className="mx-auto py-4 px-4">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a1a]">
              Create New Event
            </h1>
            <p className="text-gray-600 text-sm">Fill in the event details</p>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Save Draft
            </button>
            <button
              type="button"
              className="px-3 py-1.5 bg-gray-100 rounded text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
            >
              Preview
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
                  placeholder="Enter event title"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
                  placeholder="Describe your event..."
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Language *
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
              Date & Time
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Event Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="date_time"
                  value={formData.date_time}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
                  placeholder="e.g., 4 hours"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
              Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Venue Name *
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
                  placeholder="e.g., Central Park"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
                  placeholder="e.g., New York, NY"
                />
              </div>
            </div>
          </div>

          {/* Tickets & Pricing */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
              Tickets & Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Total Tickets *
                </label>
                <input
                  type="number"
                  name="total_tickets"
                  value={formData.total_tickets}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ticket Price ($) *
                </label>
                <input
                  type="number"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
                  placeholder="e.g., 45.00"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Age Limit *
                </label>
                <input
                  type="text"
                  name="ageLimit"
                  value={formData.ageLimit}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm"
                  placeholder="e.g., All ages, 18+, etc."
                />
              </div>
            </div>
          </div>

          {/* Event Images */}
          <div className="pb-4">
            <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
              Event Images
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Thumbnail Image *
                </label>
                <div className="border border-dashed border-gray-300 rounded p-3 text-center hover:border-[#effe8b] transition">
                  {thumbnailPreview ? (
                    <>
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="mx-auto h-16 w-16 object-cover mb-2 rounded"
                      />
                      <p className="text-xs text-green-600 mb-2">
                        Thumbnail selected
                      </p>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-image text-2xl text-gray-400 mb-2"></i>
                      <p className="text-xs text-gray-600 mb-2">
                        Upload thumbnail image
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    className="hidden"
                    id="thumbnailUpload"
                    onChange={handleFileChange}
                    required
                  />
                  <label
                    htmlFor="thumbnailUpload"
                    className="bg-[#1a1a1a] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-opacity-90 transition cursor-pointer"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Banner Image *
                </label>
                <div className="border border-dashed border-gray-300 rounded p-3 text-center hover:border-[#effe8b] transition">
                  {bannerPreview ? (
                    <>
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="mx-auto h-16 w-16 object-cover mb-2 rounded"
                      />
                      <p className="text-xs text-green-600 mb-2">
                        Banner selected
                      </p>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-image text-2xl text-gray-400 mb-2"></i>
                      <p className="text-xs text-gray-600 mb-2">
                        Upload banner image
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    name="banner"
                    accept="image/*"
                    className="hidden"
                    id="bannerUpload"
                    onChange={handleFileChange}
                    required
                  />
                  <label
                    htmlFor="bannerUpload"
                    className="bg-[#1a1a1a] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-opacity-90 transition cursor-pointer"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-xs text-gray-600">
              <i className="fas fa-info-circle mr-1"></i>
              All fields marked with * are required
            </div>
            <div className="flex space-x-2">
              {/* Update the Cancel button to use handleCancel */}
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1a1a1a] text-white rounded text-sm font-medium hover:bg-opacity-90 transition"
              >
                Create Event
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;