import { useState, useEffect } from 'react';
import { axiosInstance } from "../../utils/axios";
import Header from '../../components/Header';
import MobileMenu from '../../components/MobileMenu';
import HeroBanner from './components/HeroBanner';
import CategoriesSection from './components/CategoriesSection';
import EventsSection from './components/EventsSection';
import Footer from '../../components/Footer';
import { MapPin } from "lucide-react";

const EventsPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all'); // NEW: State for filter
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/events/public');
        
        let eventsData = [];
        if (Array.isArray(response.data)) {
            eventsData = response.data;
        } else if (response.data && Array.isArray(response.data.events)) {
            eventsData = response.data.events;
        } else if (response.data && Array.isArray(response.data.data)) {
            eventsData = response.data.data;
        }

        const transformedEvents = eventsData.map(event => ({
          id: event._id,
          img: event.images?.thumbnail || '/images/default-event.jpg',
          bannerImg: event.images?.banner || event.images?.thumbnail || '/images/default-event.jpg',
          date: formatDate(event.date_time),
          title: event.title,
          venue: event.venue,
          // FIX: Pass price as a clean number to handle the Rupee symbol properly in the card
          price: event.ticketPrice || 0, 
          category: event.category || 'general',
          total_tickets: event.total_tickets,
          tickets_sold: event.tickets_sold
        }));
        
        setEvents(transformedEvents);

        // NEW: Create category list and prepend "ALL"
        const uniqueCategories = [...new Set(eventsData.map(event => event.category))].filter(Boolean);
        const categoryData = [
          { name: 'ALL EVENTS', type: 'all', emoji: '🌟' }, // Default 'All' option
          ...uniqueCategories.map(category => ({
            name: category.toUpperCase(),
            type: category.toLowerCase(),
            emoji: getEmojiForCategory(category)
          }))
        ];

        setCategories(categoryData);

        const uniqueLocations = [...new Set(eventsData.map(event => event.location))].filter(Boolean);
        setLocations(uniqueLocations);

        setError(null);

      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load upcoming events.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date TBA';
      const options = { 
        weekday: 'short', day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Date TBA';
    }
  };

  const getEmojiForCategory = (category) => {
    if (!category) return '🎉';
    const emojiMap = {
      'festival': '🎃', 'carnival': '🎪', 'show': '⭐', 'meetup': '👥',
      'health': '🏥', 'workshop': '📚', 'sports': '🏃', 'dog': '🐶',
      'cat': '🐱', 'pets & animals': '🐾', 'pets': '🐾', 'music': '🎵',
      'food': '🍕', 'art': '🎨', 'tech': '💻', 'business': '💼',
      'education': '📖', 'general': '🎉'
    };
    return emojiMap[category.toLowerCase()] || '🎉';
  };

  // NEW: Filter events based on selected category and location
  const filteredEvents = events.filter(event => {
    const matchCategory = selectedCategory === 'all' || event.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchLocation = selectedLocation === 'all' || event.location === selectedLocation;
    return matchCategory && matchLocation;
  });

  if (loading) {
    return (
      <div className="bg-[#f2c737] min-h-screen flex flex-col">
        <Header onMenuToggle={toggleMobileMenu} />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-xl font-bold text-[#1a1a1a]">Loading events...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f2c737] min-h-screen flex flex-col">
        <Header onMenuToggle={toggleMobileMenu} />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-xl text-red-600 font-bold bg-white px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#f2c737] min-h-screen">
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}
      
      {events.length > 0 ? (
        <>
          <HeroBanner events={events} />

          {/* Location Filter */}
          <section className="bg-[#f2c737] pt-12 pb-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-xl border border-red-200">
                    <MapPin className="text-red-500 w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1a1a1a]">Filter by Location</h2>
                </div>
                <select 
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full sm:w-64 px-4 py-3 bg-gray-50 border-2 border-black rounded-xl font-bold text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#f2c737] cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <option value="all">Everywhere</option>
                  {locations.map((loc, idx) => (
                    <option key={idx} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {categories.length > 0 && (
            <CategoriesSection 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
          )}
          {/* Pass the filtered events to the section */}
          <EventsSection events={filteredEvents} /> 
        </>
      ) : (
        <div className="flex-grow flex flex-col justify-center items-center px-4 py-24">
          <div className="bg-white p-12 md:p-16 rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-3xl w-full text-center relative overflow-hidden">
             {/* Decorative element */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#f2c737] rounded-full border-4 border-black opacity-50 hidden sm:block"></div>
             
             <div className="inline-block bg-[#1a1a1a] p-5 rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_#f2c737] mb-8 rotate-3 cursor-default hover:rotate-6 transition-transform">
               <span className="text-6xl" role="img" aria-label="dog emoji">🐶</span>
             </div>
             
             <h2 className="text-4xl md:text-5xl font-black text-[#1a1a1a] mb-6 tracking-tight uppercase">
                It's Too Quiet Here!
             </h2>
             
             <p className="text-xl md:text-2xl font-bold text-gray-600 mb-0 leading-relaxed">
                We are currently cooking up some amazing new events for you and your furry friends. 
                <br className="hidden md:block"/> Check back again very soon!
             </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventsPage;