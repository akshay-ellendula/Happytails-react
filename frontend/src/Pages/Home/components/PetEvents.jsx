import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react'; // Added Loader2
import { axiosInstance } from '../../../utils/axios'; // Added axiosInstance

// Helper to format date for display on the homepage card
const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date TBA';
      }
      const options = { 
        day: '2-digit', 
        month: 'short',
        year: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Date TBA';
    }
  };

const PetEvents = () => {
  const [allEvents, setAllEvents] = useState([]); // Stores all upcoming events
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0); // For rotation

  // --- 1. Data Fetching ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetches only UPCOMING events from the public API endpoint
        const response = await axiosInstance.get('/events/public'); 
        
        // Handle nested data structure from the API
        let eventsData = [];
        // Assuming the API response is { events: [...] } or just [...]
        if (Array.isArray(response.data.events)) {
            eventsData = response.data.events; 
        } else if (Array.isArray(response.data)) {
            eventsData = response.data;
        }

        const processedEvents = eventsData.map(event => ({
          id: event._id,
          title: event.title,
          date: formatDate(event.date_time),
          location: event.location, // Assuming the location field holds a display value
          // attendees is approximated by tickets_sold
          attendees: event.tickets_sold, 
          description: event.description,
          image: event.images?.thumbnail || '/images/default-event.jpg',
          ticketsLeft: event.total_tickets - event.tickets_sold,
          isSoldOut: (event.total_tickets - event.tickets_sold) <= 0
        }));
        
        setAllEvents(processedEvents); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching homepage events:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // --- 2. Rotation Logic ---
  useEffect(() => {
    if (allEvents.length <= 3) return; // No need to rotate if 3 or fewer events
    
    // Set interval to rotate products every 10 seconds (10000ms)
    const intervalId = setInterval(() => {
      setOffset(prevOffset => {
        const nextOffset = prevOffset + 3;
        // If next offset goes past the end, reset to 0
        if (nextOffset >= allEvents.length) {
          return 0; 
        }
        return nextOffset;
      });
    }, 10000); 

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [allEvents.length]); 

  // Slice the list to get the current 3 events
  const eventsToDisplay = allEvents.slice(offset, offset + 3);

  return (
    <section className="slide-up mx-5 lg:mx-[75px] my-12 lg:my-24 bg-[#effe8b]">
      <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-[#1a1a1a] text-center">Upcoming Pet Events</h2>
      {/* Set a minimum height to prevent layout shift during rotation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto min-h-[500px]">
        {loading ? (
            <div className="md:col-span-3 flex justify-center py-20">
                <Loader2 className="animate-spin w-8 h-8 text-[#1a1a1a]"/>
            </div>
        ) : eventsToDisplay.length > 0 ? (
          eventsToDisplay.map((event) => (
            <div key={event.id} className="bg-white border-2 border-black rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <Link to={`/event/${event.id}`} className="no-underline text-inherit">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-[#effe8b] px-3 py-1 rounded-full text-sm font-bold border border-black text-[#1a1a1a]">
                    {event.isSoldOut ? "Sold Out" : "Upcoming"}
                  </div>
                </div>
              </Link>
              
              <div className="p-6 flex flex-col justify-between h-auto">
                <div>
                    <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{event.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-[#1a1a1a]" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-[#1a1a1a]" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Users className="w-4 h-4 mr-2 text-[#1a1a1a]" />
                    {event.attendees} tickets sold
                  </div>
                </div>
                
                <Link 
                  to={`/event/${event.id}`}
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors border border-black 
                    ${event.isSoldOut 
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                        : 'bg-[#1a1a1a] text-white hover:bg-[#1a1a1a]/90'
                    }`}
                >
                  {event.isSoldOut ? "Sold Out" : "View Details"}
                </Link>
              </div>
            </div>
          ))
        ) : (
            <div className="md:col-span-3 text-lg text-gray-600 py-20">No upcoming events available.</div>
        )}
      </div>
      
      <div className="text-center mt-10">
        <Link 
          to="/events"
          className="inline-block px-8 py-3 text-lg text-white bg-[#1a1a1a] border-2 border-[#1a1a1a] rounded-full transition-all duration-300 hover:bg-transparent hover:text-[#1a1a1a] font-semibold"
        >
          View All Events
        </Link>
      </div>
    </section>
  );
};

export default PetEvents;