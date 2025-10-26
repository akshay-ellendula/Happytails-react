import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { axiosInstance } from "../../utils/axios.js";
import Header from '../Events/components/Header';
import Footer from '../Events/components/Footer';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import EventGuideSection from './components/EventGuideSection';
import FAQSection from './components/FAQSection';
import TermsSection from './components/TermsSection';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axiosInstance.get(`/api/events/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleBookTickets = () => {
    if (!event) return;
    
    navigate('/booking', { 
      state: { 
        event: {
          id: event._id,
          title: event.title,
          price: event.ticketPrice,
          venue: event.venue,
          date: event.date_time,
          ticketsLeft: event.total_tickets - event.tickets_sold,
          totalTickets: event.total_tickets,
          ticketsSold: event.tickets_sold,
          image: event.images?.thumbnail
        }
      } 
    });
  };

  if (loading) {
    return (
      <div className="bg-[#effe8b] min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-150">
          <div className="text-xl">Loading event details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-[#effe8b] min-h-screen">
        <Header />
        <div className="flex justify-center items-center h-150">
          <div className="text-xl text-red-500">Event not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#effe8b] min-h-screen">
      <Header />
      <HeroSection event={event} onBookTickets={handleBookTickets} /> 
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <AboutSection event={event} />
              <EventGuideSection event={event} />
            </div>
            <div className="space-y-8">
              <FAQSection />
              <TermsSection />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default EventDetailPage;