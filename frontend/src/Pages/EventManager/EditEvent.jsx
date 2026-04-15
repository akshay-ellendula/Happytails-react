import React, { useState } from "react";
import { ArrowLeft, Save, Trash2, Loader2, XCircle } from "lucide-react"; // <-- Added XCircle icon
import { axiosInstance } from '../../utils/axios.js';

const EditEvent = ({ setCurrentPage, eventData }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: eventData?.title || "",
    description: eventData?.description || "",
    category: eventData?.category || "",
    language: eventData?.language || "English",
    date_time: eventData?.date_time ? new Date(eventData.date_time).toISOString().slice(0, 16) : "",
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    setFormData(prev => ({ ...prev, [name]: file }));

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (name === 'thumbnail') setThumbnailPreview(previewUrl);
      else if (name === 'banner') setBannerPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key !== 'thumbnail' && key !== 'banner') {
        data.append(key, formData[key]);
      }
    });

    if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);
    if (formData.banner) data.append('banner', formData.banner);

    try {
        await axiosInstance.put(`/events/${eventData._id}`, data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        alert('Event updated successfully!');
        setCurrentPage("events");
    } catch (error) {
        console.error("Update error:", error);
        alert(error.response?.data?.message || "Failed to update event");
    } finally {
        setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentPage("events");
  };

  // Standard Delete (Not ideal if tickets exist, based on your backend logic)
  const confirmDelete = async () => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        try {
            await axiosInstance.delete(`/events/${eventData._id}`);
            alert('Event deleted successfully!');
            setCurrentPage("events");
        } catch (error) {
            console.error("Delete error:", error);
            alert(error.response?.data?.message || "Failed to delete event. If tickets exist, try cancelling instead.");
        }
    }
  };

  // --- NEW: Cancel Event & Refund Logic ---
  const handleCancelEvent = async () => {
    const reason = window.prompt(
      "Are you sure you want to cancel this event?\n\nPlease enter a reason (this will be emailed to all ticket holders):"
    );

    if (reason === null) return; // User clicked cancel
    if (reason.trim() === "") {
      alert("A reason is required to cancel the event.");
      return;
    }

    try {
      setIsLoading(true);
      await axiosInstance.put(`/events/${eventData._id}/cancel`, { reason });
      alert("Event cancelled successfully. Emails have been sent to ticket holders and partial refunds initiated.");
      setCurrentPage("events");
    } catch (err) {
      console.error("Error cancelling event:", err);
      alert(err.response?.data?.message || "Failed to cancel event");
    } finally {
      setIsLoading(false);
    }
  };

  if (!eventData) return <div>No Event Data Found</div>;

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button onClick={handleCancel} className="text-xl text-gray-700 hover:text-[#1a1a1a]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1a1a]">Edit Event</h1>
              <p className="text-gray-600">Update your event details</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto py-4 px-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
             <div className="flex items-center gap-4 text-sm">
                <span className="font-bold">Tickets Sold:</span> {eventData.tickets_sold || 0} / {eventData.total_tickets}
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Event Title</label>
                  <input 
                    type="text" name="title" value={formData.title} onChange={handleInputChange} required 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    name="description" value={formData.description} onChange={handleInputChange} required rows="3" 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                    <option value="">Select Category</option>
                    <option value="training">Training</option>
                    <option value="competition">Competition</option>
                    <option value="workshop">Workshop</option>
                    <option value="adoption">Adoption Event</option>
                    <option value="social">Social Gathering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
                  <select name="language" value={formData.language} onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
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
                        <label className="block text-xs font-medium text-gray-700 mb-1">Event Date & Time</label>
                        <input type="datetime-local" name="date_time" value={formData.date_time} onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                        <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="e.g., 4 hours" />
                     </div>
                </div>
            </div>

            {/* Location */}
            <div className="border-b border-gray-200 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Venue Name</label>
                        <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                     </div>
                </div>
            </div>

            {/* Tickets & Pricing */}
            <div className="border-b border-gray-200 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Total Tickets</label>
                        <input type="number" name="total_tickets" value={formData.total_tickets} onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Ticket Price (₹)</label>
                        <input type="number" name="ticketPrice" value={formData.ticketPrice} onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                     </div>
                     <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Age Limit</label>
                        <input type="text" name="ageLimit" value={formData.ageLimit} onChange={handleInputChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
                     </div>
                </div>
            </div>

            {/* Images */}
            <div className="pb-4">
              <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">Event Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Thumbnail</label>
                    {!thumbnailPreview && eventData.images?.thumbnail && (
                        <img src={eventData.images.thumbnail} alt="Current" className="h-20 mb-2 rounded object-cover"/>
                    )}
                    {thumbnailPreview && <img src={thumbnailPreview} alt="New" className="h-20 mb-2 rounded object-cover border-2 border-green-500"/>}
                    
                    <input 
                      type="file" 
                      name="thumbnail" 
                      onChange={handleFileChange} 
                      accept="image/*"
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 mt-2" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Banner</label>
                    {!bannerPreview && eventData.images?.banner && (
                        <img src={eventData.images.banner} alt="Current" className="h-20 mb-2 rounded object-cover"/>
                    )}
                    {bannerPreview && <img src={bannerPreview} alt="New" className="h-20 mb-2 rounded object-cover border-2 border-green-500"/>}
                    
                    <input 
                      type="file" 
                      name="banner" 
                      onChange={handleFileChange} 
                      accept="image/*"
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 mt-2" 
                    />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 gap-4">
              
              {/* Destructive Actions (Left) */}
              <div className="flex space-x-2 w-full sm:w-auto">
                <button 
                  type="button" 
                  onClick={confirmDelete}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                  title="Only works if no tickets are sold"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelEvent}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded text-sm font-medium hover:bg-red-100 flex items-center gap-2"
                  title="Cancels event, refunds tickets, and notifies attendees"
                >
                  <XCircle className="w-4 h-4" /> Cancel & Refund
                </button>
              </div>

              {/* Save/Cancel Actions (Right) */}
              <div className="flex space-x-2 w-full sm:w-auto justify-end">
                <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50">
                  Back
                </button>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#1a1a1a] text-white rounded text-sm font-medium hover:bg-opacity-90 flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : <Save className="w-4 h-4" />}
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