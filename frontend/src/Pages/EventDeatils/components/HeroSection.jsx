import { Calendar, MapPin } from 'lucide-react';

const HeroSection = ({ event, onBookTickets }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- LOGIC UPDATES START ---
  
  // 1. Check if event is sold out
  const ticketsLeft = event.total_tickets - event.tickets_sold;
  const isSoldOut = ticketsLeft === 0;

  // 2. Check if event date has passed (Booking Closed)
  const eventDate = new Date(event.date_time);
  const currentDate = new Date();
  const isExpired = eventDate < currentDate;

  // --- LOGIC UPDATES END ---

  return (
    <section className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Event Image */}
          <div className="lg:w-7/12">
            <div className="rounded-3xl shadow-2xl overflow-hidden h-[400px] relative">
              <img 
                src={event.images?.banner || event.images?.thumbnail} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              
              {/* Overlays for status */}
              {isSoldOut ? (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg">
                    SOLD OUT
                  </span>
                </div>
              ) : (
                ticketsLeft < 10 && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Only {ticketsLeft} left!
                  </div>
                )
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="lg:w-5/12">
            <div className="mb-4">
              <span className="bg-gray-100 text-[#1a1a1a] px-3 py-1 rounded-full text-sm font-semibold">
                {event.category}
              </span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-[#1a1a1a] mb-4 leading-tight">
              {event.title}
            </h1>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-[#1a1a1a]">
                <Calendar className="w-5 h-5 mr-3 text-[#1a1a1a]" />
                <span className="font-medium">{formatDate(event.date_time)}</span>
              </div>
              <div className="flex items-center text-[#1a1a1a]">
                <MapPin className="w-5 h-5 mr-3 text-[#1a1a1a]" />
                <span className="font-medium">{event.venue}</span>
              </div>
              
              {!isSoldOut && !isExpired && ticketsLeft > 0 && (
                <div className="flex items-center text-green-600">
                  <span className="text-sm font-semibold">
                    {ticketsLeft} tickets available
                  </span>
                </div>
              )}
            </div>

            <div className="bg-[#effe8b] rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#1a1a1a] mb-1">Starts from</p>
                  <p className="text-2xl font-bold text-[#1a1a1a]">
                    {event.ticketPrice === 0 ? 'Free Entry' : `₹${event.ticketPrice} onwards`}
                  </p>
                </div>
                
                {/* Updated Button Logic */}
                <button 
                  onClick={onBookTickets}
                  disabled={isSoldOut || isExpired}
                  className={`font-bold px-8 py-3 rounded-full transition transform hover:scale-105 ${
                    isExpired
                        ? 'bg-gray-400 text-white cursor-not-allowed' // Style for Expired
                        : isSoldOut 
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' // Style for Sold Out
                            : 'bg-[#1a1a1a] text-white hover:bg-gray-800' // Style for Active
                  }`}
                >
                  {isExpired 
                    ? 'Booking Closed'
                    : isSoldOut 
                        ? 'SOLD OUT' 
                        : (event.ticketPrice === 0 ? 'REGISTER NOW' : 'BOOK TICKETS')
                  }
                </button>
              </div>

              {/* Progress bar only if active and low stock */}
              {!isSoldOut && !isExpired && ticketsLeft > 0 && ticketsLeft <= 20 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all" 
                      style={{ width: `${(ticketsLeft / event.total_tickets) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    Hurry! Only {ticketsLeft} tickets left
                  </p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;