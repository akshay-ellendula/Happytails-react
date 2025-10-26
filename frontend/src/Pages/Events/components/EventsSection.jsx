import EventCard from './EventCard';

const EventsSection = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <section className="py-16 bg-[#effe8b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-6">All Pet Events</h2>
          <div className="text-center text-gray-500">No events found</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#effe8b]">
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