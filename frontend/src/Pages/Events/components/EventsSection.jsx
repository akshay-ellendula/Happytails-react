import EventCard from './EventCard';
import { CalendarX2 } from 'lucide-react';

const EventsSection = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <section className="py-16 bg-[#f2c737]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">Explore Events</h2>
          
          <div className="bg-white p-10 md:p-14 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center max-w-3xl mx-auto my-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gray-100 rounded-full border-4 border-black translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="bg-[#f2c737] p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 transform -rotate-6 relative z-10">
              <CalendarX2 size={56} className="text-[#1a1a1a]" strokeWidth={2.5} />
            </div>
            
            <h3 className="text-4xl font-black text-[#1a1a1a] mb-4 tracking-tight uppercase relative z-10">
              Oops! No Matches Found
            </h3>
            
            <p className="text-xl font-bold text-gray-600 relative z-10">
              Looks like we don't have any events matching your exact filters. <br className="hidden sm:block" /> Try adjusting the category or location!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#f2c737]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">All Pet Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;