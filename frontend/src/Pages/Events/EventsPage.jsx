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
        const response = await axiosInstance.get('/events/public/upcoming');
        const eventsData = response.data;
        if (!eventsData || eventsData.length === 0) {
          setEvents(getStaticEvents());
          setCategories(getStaticCategories());
          setLoading(false);
          return;
        }
        const transformedEvents = eventsData.map(event => ({
          id: event._id,
          img: event.images?.thumbnail || '/images/default-event.jpg',
          bannerImg: event.images?.banner || event.images?.thumbnail || '/images/default-event.jpg',
          date: formatDate(event.date_time),
          title: event.title,
          venue: event.venue,
          price: event.ticketPrice === 0 || !event.ticketPrice ? 'Free Entry' : `${event.ticketPrice}`,
          buttonText: event.ticketPrice === 0 ? 'Free Register' : 'Book tickets',
          category: event.category || 'general'
        }));
        setEvents(transformedEvents);
        const uniqueCategories = [...new Set(eventsData.map(event => event.category))].filter(Boolean);
        const categoryData = uniqueCategories.map(category => ({
          name: category.toUpperCase(),
          type: category.toLowerCase(),
          emoji: getEmojiForCategory(category)
        }));
        setCategories(categoryData.length > 0 ? categoryData : getStaticCategories());
      } catch (error) {
        console.error('Error fetching events:', error);
        
        if (error.response?.status === 404) {
          setEvents(getStaticEvents());
          setCategories(getStaticCategories());
          setError(null);
        } else {
          setError('Failed to load events');
          setEvents(getStaticEvents());
          setCategories(getStaticCategories());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const getStaticCategories = () => [
    { emoji: '🐶', name: 'DOG SHOWS', type: 'dog' },
    { emoji: '🐱', name: 'CAT EVENTS', type: 'cat' },
    { emoji: '🎪', name: 'CARNIVALS', type: 'carnival' },
    { emoji: '🏃', name: 'SPORTS', type: 'sports' },
    { emoji: '📚', name: 'WORKSHOPS', type: 'workshop' },
    { emoji: '🏥', name: 'HEALTH', type: 'health' },
    { emoji: '🎃', name: 'FESTIVALS', type: 'festival' },
    { emoji: '👥', name: 'MEETUPS', type: 'meetup' },
  ];

  if (loading) {
    return (
      <div className="bg-[#effe8b] min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-200">
          <div className="text-xl">Loading events...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="bg-[#effe8b] min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-500">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#effe8b] min-h-screen">
      <Header />
      <HeroBanner events={events} />
      <CategoriesSection categories={categories} />
      <EventsSection events={events} />
      <Footer />
    </div>
  );
};

export default EventsPage;