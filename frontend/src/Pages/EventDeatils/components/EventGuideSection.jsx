import { Languages, Clock, User, Navigation } from 'lucide-react';

const EventGuideSection = ({ event }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Event Guide</h2>

      {/* Event Details */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center p-4 bg-[#111] rounded-xl">
          <Languages className="w-5 h-5 mr-4 text-[#f2c737]" />
          <div>
            <p className="text-sm text-white/40">Language</p>
            <p className="font-medium text-white">{event.language}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-[#111] rounded-xl">
          <Clock className="w-5 h-5 mr-4 text-[#f2c737]" />
          <div>
            <p className="text-sm text-white/40">Duration</p>
            <p className="font-medium text-white">{event.duration}</p>
          </div>
        </div>
        <div className="flex items-center p-4 bg-[#111] rounded-xl">
          <User className="w-5 h-5 mr-4 text-[#f2c737]" />
          <div>
            <p className="text-sm text-white/40">Age Limit</p>
            <p className="font-medium text-white">{event.ageLimit}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 my-8"></div>

      {/* Venue */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Venue</h3>
        <div className="p-4 bg-[#111] rounded-xl">
          <p className="font-semibold text-white mb-1">{event.venue}</p>
          <p className="text-white/40 text-sm">{event.location}</p>
        </div>
      </div>
    </div>
  );
};

export default EventGuideSection;