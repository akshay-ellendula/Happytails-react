// pages/Home/components/PetEvents.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { axiosInstance } from '../../../utils/axios';

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
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/events/public');
        
        let eventsData = [];
        if (Array.isArray(response.data.events)) {
            eventsData = response.data.events; 
        } else if (Array.isArray(response.data)) {
            eventsData = response.data;
        }

        const processedEvents = eventsData.map(event => ({
          id: event._id,
          title: event.title,
          date: formatDate(event.date_time),
          location: event.location,
          attendees: event.tickets_sold, 
          description: event.description,
          image: event.images?.thumbnail || "/api/placeholder/400/300",
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

  useEffect(() => {
    if (allEvents.length <= 3) return;
    
    const intervalId = setInterval(() => {
      setOffset(prevOffset => {
        const nextOffset = prevOffset + 3;
        if (nextOffset >= allEvents.length) {
          return 0; 
        }
        return nextOffset;
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [allEvents.length]);

  const eventsToDisplay = allEvents.slice(offset, offset + 3);

  return (
    <section className="py-16 lg:py-24 bg-[#f2c737]">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-3xl lg:text-4xl font-bold mb-12 text-[#1a1a1a] text-center">
          Upcoming Pet Events
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="md:col-span-3 flex justify-center py-20">
              <Loader2 className="animate-spin w-8 h-8 text-[#1a1a1a]"/>
            </div>
          ) : eventsToDisplay.length > 0 ? (
            eventsToDisplay.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-black">
                <Link to={`/event/${event.id}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-[#f2c737] px-3 py-1 rounded-full text-sm font-bold border border-black text-[#1a1a1a]">
                      Upcoming
                    </div>
                  </div>
                </Link>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-3">{event.title}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="w-4 h-4 mr-2 text-[#f2c737]" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="w-4 h-4 mr-2 text-[#f2c737]" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Users className="w-4 h-4 mr-2 text-[#f2c737]" />
                      {event.attendees} attending
                    </div>
                  </div>
                  
                  <Link 
                    to={`/event/${event.id}`}
                    className="inline-block w-full text-center px-4 py-2 bg-[#1a1a1a] text-white rounded-lg hover:bg-[#1a1a1a]/90 transition-colors border border-black"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-3 text-center py-20">
              <p className="text-lg text-gray-600">No upcoming events available.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/events"
            className="inline-block px-8 py-3 text-lg text-white bg-[#1a1a1a] border-2 border-black rounded-full hover:bg-transparent hover:text-[#1a1a1a] transition-colors font-semibold"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PetEvents;