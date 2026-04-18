// pages/Home/components/PetEvents.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Loader2, ArrowRight, Ticket } from 'lucide-react';
import { axiosInstance } from '../../../utils/axios';

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date TBA';
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return 'Date TBA';
  }
};

const PetEvents = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/events/public');
        let eventsData = Array.isArray(response.data.events) ? response.data.events : (Array.isArray(response.data) ? response.data : []);

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
      } catch (error) {
        console.error("Error fetching homepage events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (allEvents.length <= 3) return;
    const intervalId = setInterval(() => {
      setOffset(prev => (prev + 3 >= allEvents.length) ? 0 : prev + 3);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [allEvents.length]);

  const eventsToDisplay = allEvents.slice(offset, offset + 3);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-[#f2c737] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-[#1a1a1a]/5 blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white/20 blur-3xl"></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1a1a1a]/10 backdrop-blur-sm mb-4">
            <Calendar className="w-4 h-4 text-[#1a1a1a]" />
            <span className="text-sm font-bold text-[#1a1a1a] uppercase tracking-wider">Don't Miss Out</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#1a1a1a] mb-4 tracking-tight">
            Upcoming Pet Events
          </h2>
          <p className="text-[#1a1a1a]/70 text-lg max-w-2xl mx-auto">
            Join thousands of pet lovers at our exciting events — from dog shows to adoption drives
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="md:col-span-3 flex justify-center py-20">
              <Loader2 className="animate-spin w-8 h-8 text-[#1a1a1a]" />
            </div>
          ) : eventsToDisplay.length > 0 ? (
            eventsToDisplay.map((event, index) => (
              <div
                key={event.id}
                className={`group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-black/10 hover:-translate-y-2 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              >
                <Link to={`/event/${event.id}`}>
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-[#f2c737] px-3 py-1 rounded-full text-xs font-black border border-black/10 text-[#1a1a1a] shadow-lg uppercase tracking-wider">
                      {event.isSoldOut ? 'Sold Out' : 'Upcoming'}
                    </div>

                    {/* Tickets left pill */}
                    {!event.isSoldOut && event.ticketsLeft > 0 && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#1a1a1a]">
                        <Ticket className="w-3 h-3" />
                        {event.ticketsLeft} tickets left
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-3 group-hover:text-[#c9a020] transition-colors line-clamp-1">{event.title}</h3>

                  <div className="space-y-2.5 mb-5">
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-[#f2c737]/20 flex items-center justify-center mr-3 flex-shrink-0">
                        <Calendar className="w-4 h-4 text-[#c9a020]" />
                      </div>
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-[#f2c737]/20 flex items-center justify-center mr-3 flex-shrink-0">
                        <MapPin className="w-4 h-4 text-[#c9a020]" />
                      </div>
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-[#f2c737]/20 flex items-center justify-center mr-3 flex-shrink-0">
                        <Users className="w-4 h-4 text-[#c9a020]" />
                      </div>
                      {event.attendees} attending
                    </div>
                  </div>

                  <Link
                    to={`/event/${event.id}`}
                    className="group/btn inline-flex w-full items-center justify-center gap-2 px-4 py-3 bg-[#1a1a1a] text-white rounded-xl hover:bg-[#2a2a2a] transition-all font-semibold text-sm"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-3 text-center py-20">
              <p className="text-lg text-[#1a1a1a]/60 font-medium">No upcoming events available.</p>
            </div>
          )}
        </div>

        {/* Carousel dots */}
        {allEvents.length > 3 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(allEvents.length / 3) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setOffset(i * 3)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === Math.floor(offset / 3) ? 'w-8 bg-[#1a1a1a]' : 'w-2 bg-[#1a1a1a]/30 hover:bg-[#1a1a1a]/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* View All CTA */}
        <div className={`text-center mt-14 ${isVisible ? 'animate-fade-in-up delay-600' : 'opacity-0'}`}>
          <Link
            to="/events"
            className="group inline-flex items-center gap-3 px-10 py-4 text-lg text-white bg-[#1a1a1a] rounded-full hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 font-bold hover:scale-105"
          >
            View All Events
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PetEvents;