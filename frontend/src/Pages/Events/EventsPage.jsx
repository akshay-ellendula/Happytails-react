import { useState, useEffect } from 'react';
import { axiosInstance } from "../../utils/axios";
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import CategoriesSection from './components/CategoriesSection';
import EventsSection from './components/EventsSection';
import Footer from './components/Footer';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/api/getPublicEvents');
        const eventsData = response.data;
        // Transform events data for frontend
        const transformedEvents = eventsData.map(event => ({
          id: event._id,
          img: event.images?.thumbnail || '/images/default-event.jpg',
          bannerImg: event.images?.banner || event.images?.thumbnail || '/images/default-event.jpg',
          date: formatDate(event.date_time),
          title: event.title,
          venue: event.venue,
          price: event.ticketPrice === 0 ? 'Free Entry' : `₹${event.ticketPrice} onwards`,
          buttonText: event.ticketPrice === 0 ? 'Register Now' : 'Book tickets',
          category: event.category
        }));

        setEvents(transformedEvents);

        // Extract unique categories from events
        const uniqueCategories = [...new Set(eventsData.map(event => event.category))];
        const categoryData = uniqueCategories.map(category => ({
          name: category.toUpperCase(),
          type: category.toLowerCase(),
          emoji: getEmojiForCategory(category)
        }));

        // If no categories from API, use fallback
        setCategories(categoryData.length > 0 ? categoryData : getStaticCategories());
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
        // Fallback to static data if API fails
        setEvents(getStaticEvents());
        setCategories(getStaticCategories());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getEmojiForCategory = (category) => {
    const emojiMap = {
      'festival': '🎃',
      'carnival': '🎪',
      'show': '⭐',
      'meetup': '👥',
      'health': '🏥',
      'workshop': '📚',
      'sports': '🏃',
      'dog': '🐶',
      'cat': '🐱'
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

  const getStaticEvents = () => [
    {
      id: 1,
      img: "/images/halloween-pet.jpg",
      bannerImg: "/images/halloween-pet.jpg",
      date: 'Sat, 01 Nov, Multiple slots',
      title: 'Halloween Pet Experience',
      venue: 'Akan Hyderabad',
      price: '₹899 onwards',
      buttonText: 'Book tickets',
      category: 'festival'
    },
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