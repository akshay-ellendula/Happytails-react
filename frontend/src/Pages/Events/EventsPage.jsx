import { useState, useEffect } from 'react';
import { axiosInstance } from "../../utils/axios";
import Header from '../Home/components/Header';
import HeroBanner from './components/HeroBanner';
import CategoriesSection from './components/CategoriesSection';
import EventsSection from './components/EventsSection';
import Footer from '../Home/components/Footer';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/events/public');
        
        console.log("API Response:", response.data); // Check console to see structure

        // --- FIX START ---
        // Handle if API returns direct array OR nested object
        let eventsData = [];
        if (Array.isArray(response.data)) {
            eventsData = response.data;
        } else if (response.data && Array.isArray(response.data.events)) {
            eventsData = response.data.events; // Handle { events: [...] }
        } else if (response.data && Array.isArray(response.data.data)) {
            eventsData = response.data.data;   // Handle { data: [...] }
        }
        // --- FIX END ---

        // 1. Transform events data for frontend
        const transformedEvents = eventsData.map(event => ({
          id: event._id,
          img: event.images?.thumbnail || '/images/default-event.jpg',
          bannerImg: event.images?.banner || event.images?.thumbnail || '/images/default-event.jpg',
          date: formatDate(event.date_time),
          title: event.title,
          venue: event.venue,
          price: event.ticketPrice === 0 || !event.ticketPrice ? 'Free Entry' : `₹${event.ticketPrice}`,
          buttonText: event.ticketPrice === 0 ? 'Free Register' : 'Book tickets',
          category: event.category || 'general'
        }));
        
        setEvents(transformedEvents);

        // 2. Extract unique categories dynamically
        const uniqueCategories = [...new Set(eventsData.map(event => event.category))].filter(Boolean);
        const categoryData = uniqueCategories.map(category => ({
          name: category.toUpperCase(),
          type: category.toLowerCase(),
          emoji: getEmojiForCategory(category)
        }));

        setCategories(categoryData);
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

  // --- Helper Functions ---

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date TBA';
      }
      const options = { 
        weekday: 'short', 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Date TBA';
    }
  };

  const getEmojiForCategory = (category) => {
    if (!category) return '🎉';
    const emojiMap = {
      'festival': '🎃',
      'carnival': '🎪',
      'show': '⭐',
      'meetup': '👥',
      'health': '🏥',
      'workshop': '📚',
      'sports': '🏃',
      'dog': '🐶',
      'cat': '🐱',
      'pets & animals': '🐾',
      'pets': '🐾',
      'music': '🎵',
      'food': '🍕',
      'art': '🎨',
      'tech': '💻',
      'business': '💼',
      'education': '📖',
      'general': '🎉'
    };
    return emojiMap[category.toLowerCase()] || '🎉';
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="bg-[#effe8b] min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="text-xl font-medium text-gray-600">Loading events...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#effe8b] min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="text-xl text-red-500 font-semibold">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#effe8b] min-h-screen">
      <Header />
      
      {events.length > 0 ? (
        <>
          <HeroBanner events={events} />
          {categories.length > 0 && <CategoriesSection categories={categories} />}
          <EventsSection events={events} />
        </>
      ) : (
        <div className="flex flex-col justify-center items-center h-96 text-center p-4">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">No Upcoming Events</h2>
          <p className="text-gray-600">Check back later for new events!</p>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventsPage;