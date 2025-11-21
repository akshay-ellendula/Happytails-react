import { useParams, useNavigate } from 'react-router-dom'; // Changed to react-router-dom for best practice
import { useState, useEffect } from 'react';
import { axiosInstance } from "../../utils/axios.js";
import Header from '../../components/Header';
import MobileMenu from '../../components/MobileMenu';
import Footer from '../../components/Footer';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import EventGuideSection from './components/EventGuideSection';
import FAQSection from './components/FAQSection';
import TermsSection from './components/TermsSection';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. STATE DEFINITIONS
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  // Fixed: Added the missing state for the menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axiosInstance.get(`/events/${id}`);
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

  // 2. FUNCTION DEFINITION (Must be before any return statements)
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // 3. LOADING STATE
  if (loading) {
    return (
      <div className="bg-[#effe8b] min-h-screen">
        {/* Optional: Pass toggleMobileMenu here too if you want the menu to work while loading */}
        <Header onMenuToggle={toggleMobileMenu} /> 
        <div className="flex justify-center items-center h-150">
          <div className="text-xl">Loading event details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  // 4. ERROR STATE
  if (!event) {
    return (
      <div className="bg-[#effe8b] min-h-screen">
        <Header onMenuToggle={toggleMobileMenu} />
        <div className="flex justify-center items-center h-150">
          <div className="text-xl text-red-500">Event not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  // 5. MAIN RENDER
  return (
    <div className="bg-[#effe8b] min-h-screen">
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}
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