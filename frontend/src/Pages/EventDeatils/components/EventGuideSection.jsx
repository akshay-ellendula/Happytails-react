import { Languages, Clock, User, Navigation } from 'lucide-react';

const EventGuideSection = ({ event }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Event Guide</h2>
      
      {/* Event Details */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center p-4 bg-[#effe8b] rounded-xl">
          <Languages className="w-5 h-5 mr-4 text-[#1a1a1a]" />
          <div>
            <p className="text-sm text-[#1a1a1a]">Language</p>
            <p className="font-semibold text-[#1a1a1a]">{event.language}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-[#effe8b] rounded-xl">
          <Clock className="w-5 h-5 mr-4 text-[#1a1a1a]" />
          <div>
            <p className="text-sm text-[#1a1a1a]">Duration</p>
            <p className="font-semibold text-[#1a1a1a]">{event.duration}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-[#effe8b] rounded-xl">
          <User className="w-5 h-5 mr-4 text-[#1a1a1a]" />
          <div>
            <p className="text-sm text-[#1a1a1a]">Age Limit</p>
            <p className="font-semibold text-[#1a1a1a]">{event.ageLimit}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 my-8"></div>

      {/* Venue */}
      <div>
        <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">Venue</h3>
        <div className="p-4 bg-[#effe8b] rounded-xl">
          <p className="font-semibold text-[#1a1a1a] mb-2">{event.venue}</p>
          <p className="text-[#1a1a1a] text-sm mb-4">{event.location}</p>
          <button className="flex items-center text-[#1a1a1a] font-semibold hover:underline">
            <Navigation className="w-4 h-4 mr-2" />
            SET DIRECTIONS
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventGuideSection;