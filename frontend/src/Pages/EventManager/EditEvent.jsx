import React, { useState } from "react";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";

const EditEvent = ({ setCurrentPage, eventData }) => {
  const [formData, setFormData] = useState({
    title: eventData?.title || "",
    description: eventData?.description || "",
    category: eventData?.category || "",
    language: eventData?.language || "English",
    date_time: eventData?.date_time || "",
    duration: eventData?.duration || "",
    venue: eventData?.venue || "",
    location: eventData?.location || "",
    total_tickets: eventData?.total_tickets || "",
    ticketPrice: eventData?.ticketPrice || "",
    ageLimit: eventData?.ageLimit || "",
    thumbnail: null,
    banner: null
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (name === 'thumbnail') {
        setThumbnailPreview(previewUrl);
      } else if (name === 'banner') {
        setBannerPreview(previewUrl);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated Form Data:', formData);
    alert('Event updated successfully!');
    setCurrentPage("events");
  };

  const handleCancel = () => {
    setCurrentPage("events");
  };

  const confirmDelete = () => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      alert('Event deleted successfully!');
      setCurrentPage("events");
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="text-xl text-gray-700 hover:text-[#1a1a1a]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">Edit Event</h1>
              <p className="text-gray-600">Update your event details</p>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Editing: {eventData?.title}
          </div>
        </div>
      </header>

      <div className="mx-auto py-4 px-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-[#1a1a1a]">Edit Event</h1>
              <p className="text-gray-600 text-sm">Update your event details</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Save Draft
              </button>
              <button className="px-3 py-1.5 bg-gray-100 rounded text-sm font-medium text-gray-700 hover:bg-gray-200 transition">
                <Eye className="w-4 h-4 inline mr-1" />
                Preview
              </button>
            </div>
          </div>

          {/* Event Status & Stats */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-xs font-medium text-blue-800">Status:</span>
                  <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-blue-800">Tickets Sold:</span>
                  <span className="ml-1 text-sm font-bold">185/200</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-blue-800">Revenue:</span>
                  <span className="ml-1 text-sm font-bold">$8,325</span>
                </div>
              </div>
              <div className="text-xs text-blue-700">
                Last updated: 2 hours ago
              </div>
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
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm" 
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
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent text-sm" 
                    placeholder="Describe your event..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Language *</label>
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
              <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Event Date & Time *</label>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duration *</label>
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
              <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Venue Name *</label>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location *</label>
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
              <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Tickets & Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total Tickets *</label>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ticket Price ($) *</label>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Age Limit *</label>
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
              <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Event Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Thumbnail Image</label>
                  <div className="border border-dashed border-gray-300 rounded p-3 text-center hover:border-[#effe8b] transition">
                    {thumbnailPreview ? (
                      <>
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="mx-auto h-16 w-16 object-cover mb-2 rounded" />
                        <p className="text-xs text-green-600 mb-2">New thumbnail selected</p>
                      </>
                    ) : (
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center text-white text-sm">
                          🐕
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-gray-800">current-thumbnail.jpg</p>
                          <p className="text-xs text-gray-500">Uploaded Oct 15, 2024</p>
                        </div>
                      </div>
                    )}
                    <input 
                      type="file" 
                      name="thumbnail" 
                      accept="image/*" 
                      className="hidden" 
                      id="thumbnailUpload" 
                      onChange={handleFileChange}
                    />
                    <label 
                      htmlFor="thumbnailUpload" 
                      className="bg-[#1a1a1a] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-opacity-90 transition cursor-pointer"
                    >
                      Change Thumbnail
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Banner Image</label>
                  <div className="border border-dashed border-gray-300 rounded p-3 text-center hover:border-[#effe8b] transition">
                    {bannerPreview ? (
                      <>
                        <img src={bannerPreview} alt="Banner preview" className="mx-auto h-16 w-16 object-cover mb-2 rounded" />
                        <p className="text-xs text-green-600 mb-2">New banner selected</p>
                      </>
                    ) : (
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className="w-16 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center text-white text-sm">
                          🏞️
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-medium text-gray-800">current-banner.jpg</p>
                          <p className="text-xs text-gray-500">Uploaded Oct 15, 2024</p>
                        </div>
                      </div>
                    )}
                    <input 
                      type="file" 
                      name="banner" 
                      accept="image/*" 
                      className="hidden" 
                      id="bannerUpload" 
                      onChange={handleFileChange}
                    />
                    <label 
                      htmlFor="bannerUpload" 
                      className="bg-[#1a1a1a] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-opacity-90 transition cursor-pointer"
                    >
                      Change Banner
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button 
                  type="button" 
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Event
                </button>
              </div>
              <div className="flex space-x-2">
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#1a1a1a] text-white rounded text-sm font-medium hover:bg-opacity-90 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Update Event
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditEvent;