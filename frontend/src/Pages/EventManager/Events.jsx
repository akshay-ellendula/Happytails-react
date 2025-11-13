import React from 'react';
import { Edit, BarChart3, Trash2, Search, Plus } from 'lucide-react';

const Events = ({ setCurrentPage }) => {
  // Sample events data
  const events = [
    {
      id: 1,
      title: "Puppy Training Workshop",
      category: "Training",
      date: "Oct 20, 2024",
      time: "10:00 AM - 2:00 PM",
      location: "Central Park, NY",
      tickets: { sold: 200, total: 200 },
      revenue: 9000,
      status: "completed",
      icon: "🐕",
      color: "from-blue-400 to-blue-600"
    },
    {
      id: 2,
      title: "Dog Agility Competition",
      category: "Competition",
      date: "Nov 15, 2024",
      time: "9:00 AM - 5:00 PM",
      location: "Brooklyn, NY",
      tickets: { sold: 45, total: 50 },
      revenue: 2250,
      status: "upcoming",
      icon: "🏃",
      color: "from-green-400 to-green-600"
    },
    {
      id: 3,
      title: "Feline Behavior Workshop",
      category: "Workshop",
      date: "Dec 5, 2024",
      time: "11:00 AM - 3:00 PM",
      location: "Queens, NY",
      tickets: { sold: 18, total: 30 },
      revenue: 720,
      status: "upcoming",
      icon: "🐱",
      color: "from-purple-400 to-purple-600"
    }
  ];

  const handleEdit = (event) => {
    // Pass the event data to the edit page
    setCurrentPage("edit-event", event);
  };

  const handleCreateEvent = () => {
    setCurrentPage("create-event");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return "event-status-badge event-status-upcoming";
      case 'completed':
        return "event-status-badge event-status-completed";
      default:
        return "event-status-badge event-status-upcoming";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'upcoming':
        return "Upcoming";
      case 'completed':
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">Events Management</h1>
            <p className="text-gray-600">Create and manage your events</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search events..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#effe8b] focus:border-transparent"
              />
              <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            </div>
            <button 
              onClick={handleCreateEvent}
              className="bg-[#1a1a1a] text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1a1a1a]">All Events</h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium">Filter</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Event</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Date & Time</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Location</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Tickets</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Revenue</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="table-row border-b border-gray-100">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${event.color} rounded-lg flex items-center justify-center text-white`}>
                          <span className="emoji-icon">{event.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#1a1a1a]">{event.title}</p>
                          <p className="text-xs text-gray-500">{event.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm">{event.date}<br/><span className="text-gray-500">{event.time}</span></td>
                    <td className="py-4 text-sm">{event.location}</td>
                    <td className="py-4 text-sm">{event.tickets.sold}/{event.tickets.total}<br/>
                      <span className={`${event.tickets.sold === event.tickets.total ? 'text-green-600' : 'text-yellow-600'}`}>
                        {Math.round((event.tickets.sold / event.tickets.total) * 100)}% sold
                      </span>
                    </td>
                    <td className="py-4 text-sm font-medium">${event.revenue.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={getStatusBadge(event.status)}>
                        {getStatusText(event.status)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(event)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800 p-1">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Events;