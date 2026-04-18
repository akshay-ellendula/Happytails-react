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
      <div className="bg-[#050505] min-h-screen font-outfit">
        <Header onMenuToggle={toggleMobileMenu} />
        {/* Skeleton Hero */}
        <div className="animate-pulse">
          <div className="h-[400px] bg-[#111] w-full" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 w-48 bg-white/10 rounded-lg" />
                <div className="h-4 w-full bg-white/5 rounded-full" />
                <div className="h-4 w-5/6 bg-white/5 rounded-full" />
                <div className="h-4 w-3/4 bg-white/5 rounded-full" />
                <div className="h-4 w-2/3 bg-white/5 rounded-full" />
              </div>
              <div className="space-y-4">
                <div className="h-40 bg-[#111] rounded-2xl" />
                <div className="h-40 bg-[#111] rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 4. ERROR STATE
  if (!event) {
    return (
      <div className="bg-[#050505] min-h-screen font-outfit">
        <Header onMenuToggle={toggleMobileMenu} />
        <div className="flex justify-center items-center py-40">
          <div className="text-center">
            <div className="text-5xl mb-4">🐾</div>
            <h2 className="text-2xl font-bold text-white mb-2">Event not found</h2>
            <p className="text-white/40">This event may have been removed or the link is incorrect.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // 5. MAIN RENDER
  return (
    <div className="bg-[#050505] min-h-screen font-outfit">
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}
      <HeroSection event={event} onBookTickets={handleBookTickets} /> 
      <section className="py-12 bg-[#050505]">
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