import React, { useState, useEffect } from 'react';

const EditTicket = ({ setCurrentPage, ticketData }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  useEffect(() => {
    if (ticketData) {
      setFormData(ticketData);
      setLoading(false);
    } else {
      fetchTicketData();
    }
  }, [ticketData]);

  // Mock API call to fetch ticket data for editing
  const fetchTicketData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockTicket = {
          id: "TKT-1698512345",
          customer: {
            name: "Sarah Johnson",
            email: "sarah@email.com",
            phone: "+1 (555) 123-4567"
          },
          pet: {
            name: "Max",
            breed: "Golden Retriever",
            age: 6,
            ageUnit: "months"
          },
          status: "Active",
          purchaseDate: "2024-11-10",
          event: {
            name: "Puppy Socialization Class",
            date: "2024-11-15T10:00:00",
            venue: "Central Park, NY",
            duration: "4 hours"
          },
          price: 45.00,
          qrCode: "qr-code-12345"
        };
        setFormData(mockTicket);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching ticket data:', error);
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setFormChanged(true);
  };

  // Save changes
  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Saving ticket data:", formData);
      alert("Ticket updated successfully!");
      setFormChanged(false);
      setCurrentPage("ticket-details", formData, 'ticket');
    } catch (error) {
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    if (formChanged && !confirm("Are you sure you want to discard all changes?")) {
      return;
    }
    setCurrentPage("ticket-details", formData, 'ticket');
  };

  // Toggle ticket status
  const handleToggleStatus = () => {
    if (formData.status === 'Active') {
      // Currently Active - changing to Cancelled
      if (confirm("Are you sure you want to cancel this ticket?")) {
        setFormData(prev => ({ ...prev, status: "Cancelled" }));
        setFormChanged(true);
        alert("Ticket has been cancelled!");
      }
    } else {
      // Currently Cancelled - changing to Active
      if (confirm("Are you sure you want to activate this ticket?")) {
        setFormData(prev => ({ ...prev, status: "Active" }));
        setFormChanged(true);
        alert("Ticket has been activated!");
      }
    }
  };

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formChanged) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formChanged]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket data...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-ticket-alt text-4xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Ticket Not Found</h2>
          <p className="text-gray-500 mb-4">The ticket you're trying to edit doesn't exist.</p>
          <button 
            onClick={() => setCurrentPage("tickets")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleDiscard}
                className="text-2xl text-gray-700 hover:text-[#1a1a1a]"
              >
                ←
              </button>
              <div className="text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
                🐾 Happy Tails
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                <i className="fas fa-times mr-2"></i>Discard Changes
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formChanged}
                className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-opacity-90 transition disabled:opacity-50"
              >
                <i className={`fas ${saving ? 'fa-spinner animate-spin' : 'fa-save'} mr-2`}></i>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm">
          {/* Ticket Header */}
          <div className="text-center p-6 border-b border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl mx-auto mb-3">
              <i className="fas fa-edit"></i>
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Edit Ticket</h1>
            <p className="text-gray-600 text-sm">
              Ticket ID: <span className="font-mono font-bold">{formData.id}</span>
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column - Event & Customer Details */}
              <div className="xl:col-span-2 space-y-6">
                {/* Event Details (Read Only) */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
                    Event Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Event:</label>
                      <p className="font-medium text-sm">{formData.event.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Date & Time:</label>
                      <p className="font-medium text-sm">
                        {formatDate(formData.event.date)} • 10:00 AM
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Venue:</label>
                      <p className="font-medium text-sm">{formData.event.venue}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Duration:</label>
                      <p className="font-medium text-sm">{formData.event.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
                    Customer Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name:</label>
                      <input
                        type="text"
                        value={formData.customer.name}
                        onChange={(e) => handleInputChange('customer', 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email:</label>
                      <input
                        type="email"
                        value={formData.customer.email}
                        onChange={(e) => handleInputChange('customer', 'email', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Phone:</label>
                      <input
                        type="tel"
                        value={formData.customer.phone}
                        onChange={(e) => handleInputChange('customer', 'phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Date:</label>
                      <div className="w-full rounded-lg px-3 py-2 text-sm bg-gray-50">
                        {formatDate(formData.purchaseDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pet Information */}
              {formData.pet &&  (<div className="bg-white rounded-lg p-4 border border-gray-200">
                <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
                  Pet Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pet Name</label>
                    <input
                      type="text"
                      value={formData.pet.name}
                      onChange={(e) => handleInputChange('pet', 'name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Breed</label>
                    <input
                      type="text"
                      value={formData.pet.breed}
                      onChange={(e) => handleInputChange('pet', 'breed', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Age (months)</label>
                    <input
                      type="number"
                      value={formData.pet.age}
                      onChange={(e) => handleInputChange('pet', 'age', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="240"
                    />
                  </div>
                </div>
              </div>)}
              </div>

              {/* Right Column - Status & QR Code */}
              <div className="space-y-6">
                {/* Ticket Status & Actions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-3">
                    Ticket Status
                  </h2>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-xs text-gray-600">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          formData.status === 'Active'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {formData.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600">Price:</span>
                        <div className="ml-2 font-bold text-base">${formData.price.toFixed(2)}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleStatus}
                      className={`px-3 py-1.5 text-white rounded text-xs font-medium transition ${
                        formData.status === 'Active'
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      <i className={`fas ${formData.status === 'Active' ? 'fa-times' : 'fa-check'} mr-1`}></i>
                      {formData.status === 'Active' ? 'Cancel Ticket' : 'Activate Ticket'}
                    </button>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-gray-100 rounded-lg p-4 flex flex-col">
                  <h2 className="text-base font-semibold text-[#1a1a1a] mb-4 text-center">
                    Check-in QR Code
                  </h2>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 mb-4">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${formData.qrCode}`}
                        alt="QR Code"
                        className="w-48 h-48"
                      />
                    </div>
                    <p className="text-xs text-gray-600 text-center max-w-xs mb-4">
                      Scan this code at the event entrance for check-in
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTicket;