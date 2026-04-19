import EventCard from './EventCard';
import { CalendarX2 } from 'lucide-react';

const EventsSection = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <section className="py-16 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">Explore Events</h2>
          
          <div className="flex flex-col items-center justify-center text-center py-20">
            <CalendarX2 size={48} className="text-white/20 mb-6" strokeWidth={1.5} />
            <h3 className="text-2xl font-bold text-white mb-3">
              No Matches Found
            </h3>
            <p className="text-white/40 max-w-md">
              Looks like we don't have any events matching your exact filters. Try adjusting the category or location!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white mb-6">All Pet Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;