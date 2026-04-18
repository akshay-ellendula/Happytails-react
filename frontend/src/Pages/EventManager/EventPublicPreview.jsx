import React, { useState, useEffect } from 'react';
import HeroSection from '../EventDeatils/components/HeroSection';
import AboutSection from '../EventDeatils/components/AboutSection';
import EventGuideSection from '../EventDeatils/components/EventGuideSection';
import FAQSection from '../EventDeatils/components/FAQSection';
import TermsSection from '../EventDeatils/components/TermsSection';
import { ArrowLeft } from 'lucide-react';
import { axiosInstance } from '../../utils/axios.js';

const EventPublicPreview = ({ event: initialEvent, setCurrentPage }) => {
  const [event, setEvent] = useState(initialEvent);

  useEffect(() => {
    const fetchPopulatedEvent = async () => {
      try {
        const res = await axiosInstance.get(`/events/${initialEvent._id}`);
        setEvent(res.data);
      } catch (err) {
        console.error("Failed to load populated event", err);
      }
    };
    if (initialEvent && initialEvent._id) {
      fetchPopulatedEvent();
    }
  }, [initialEvent]);

  if (!event) return <div className="p-10 text-center font-bold">Loading Preview Data...</div>;

  return (
    <div className="bg-white min-h-full pb-12 relative flex flex-col">
      {/* Admin Control Bar */}
      <div className="bg-gray-900 sticky top-0 z-50 py-3 px-8 flex items-center justify-between shadow-md w-full">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#effe8b] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#effe8b]"></span>
          </span>
          <span className="text-gray-200 font-bold text-sm tracking-widest uppercase">Live Public Preview</span>
        </div>
        <button 
          onClick={() => setCurrentPage("event-details", event, "event")}
          className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-bold text-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-y-[2px]"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={3} />
          Exit Preview
        </button>
      </div>

      <HeroSection event={event} onBookTickets={() => alert("You are in Preview Mode. Booking mechanics are disabled here.")} /> 
      
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
    </div>
  );
};

export default EventPublicPreview;
