import { useState, useEffect } from 'react';
import { axiosInstance } from "../../utils/axios";
import Header from '../../components/Header';
import MobileMenu from '../../components/MobileMenu';
import HeroBanner from './components/HeroBanner';
import CategoriesSection from './components/CategoriesSection';
import EventsSection from './components/EventsSection';
import Footer from '../../components/Footer';
import { MapPin, Loader2 } from "lucide-react";

const EventsPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
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
          price: event.ticketPrice || 0, 
          category: event.category || 'general',
          total_tickets: event.total_tickets,
          tickets_sold: event.tickets_sold
        }));
        
        setEvents(transformedEvents);

        const uniqueCategories = [...new Set(eventsData.map(event => event.category))].filter(Boolean);
        const categoryData = [
          { name: 'ALL EVENTS', type: 'all', emoji: '🌟' },
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

  // Filter events based on selected category and location
  const filteredEvents = events.filter(event => {
    const matchCategory = selectedCategory === 'all' || event.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchLocation = selectedLocation === 'all' || event.location === selectedLocation;
    return matchCategory && matchLocation;
  });

  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen flex flex-col font-outfit">
        <Header onMenuToggle={toggleMobileMenu} />
        <div className="flex-grow">
          {/* Skeleton Hero Banner */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-[#111] rounded-2xl p-8 lg:p-14 flex flex-col lg:flex-row items-center gap-10 animate-pulse">
              <div className="flex-1 space-y-4 w-full">
                <div className="h-4 w-32 bg-white/10 rounded-full" />
                <div className="h-10 w-3/4 bg-white/10 rounded-xl" />
                <div className="h-10 w-1/2 bg-white/10 rounded-xl" />
                <div className="h-4 w-48 bg-white/10 rounded-full" />
                <div className="h-5 w-24 bg-white/10 rounded-full" />
                <div className="h-12 w-36 bg-white/10 rounded-xl mt-4" />
              </div>
              <div className="w-full max-w-[340px] aspect-[4/5] bg-white/5 rounded-2xl flex-shrink-0" />
            </div>
          </div>

          {/* Skeleton Categories */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 animate-pulse">
            <div className="h-7 w-48 bg-white/10 rounded-lg mb-6" />
            <div className="flex gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-24 h-20 bg-[#111] rounded-xl" />
              ))}
            </div>
          </div>

          {/* Skeleton Event Cards */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="h-7 w-40 bg-white/10 rounded-lg mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#111] rounded-2xl overflow-hidden">
                  <div className="h-56 bg-white/5" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 bg-white/10 rounded-lg" />
                    <div className="h-3 w-1/2 bg-white/5 rounded-full" />
                    <div className="h-3 w-2/3 bg-white/5 rounded-full" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-5 w-16 bg-white/10 rounded-full" />
                      <div className="h-9 w-24 bg-white/10 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#050505] min-h-screen flex flex-col font-outfit">
        <Header onMenuToggle={toggleMobileMenu} />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-red-400 font-medium bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-xl">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen font-outfit">
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}
      
      {events.length > 0 ? (
        <>
          <HeroBanner events={events} />

          {/* Location Filter */}
          <section className="bg-[#050505] pt-12 pb-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111] p-6 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f2c737]/10 rounded-lg flex items-center justify-center">
                    <MapPin className="text-[#f2c737] w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Filter by Location</h2>
                </div>
                <select 
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full sm:w-64 px-4 py-3 bg-[#050505] border border-white/20 rounded-xl font-medium text-white focus:outline-none focus:border-white/50 cursor-pointer appearance-none transition-colors"
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
          <EventsSection events={filteredEvents} /> 
        </>
      ) : (
        <div className="flex-grow flex flex-col justify-center items-center px-4 py-24">
          <div className="text-center max-w-lg">
            <div className="text-6xl mb-6">🐶</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              It's Too Quiet Here!
            </h2>
            <p className="text-white/50 text-lg leading-relaxed">
              We are currently cooking up some amazing new events for you and your furry friends. Check back again very soon!
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventsPage;