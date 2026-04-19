import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroBanner = ({ events }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (events.length === 0) return;

    const interval = setInterval(() => {
      goToSlide((currentSlide + 1) % events.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [events.length, currentSlide]);

  const goToSlide = (index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 50);
    }, 400);
  };

  const handleEventClick = () => {
    const featuredEvent = events[currentSlide];
    if (featuredEvent?.id) {
      navigate(`/event/${featuredEvent.id}`);
    }
  };

  if (events.length === 0) {
    return (
      <section className="bg-[#050505] py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/40">No featured events available</p>
        </div>
      </section>
    );
  }

  const featuredEvent = events[currentSlide];

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % events.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + events.length) % events.length);
  };

  const ticketsLeft = featuredEvent.total_tickets - featuredEvent.tickets_sold;
  const isSoldOut = ticketsLeft === 0;

  return (
    <section className="relative w-full h-[520px] sm:h-[560px] lg:h-[600px] overflow-hidden">

      {/* Full-bleed Background Image */}
      {events.map((event, index) => (
        <div
          key={event.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: index === currentSlide && !isAnimating ? 1 : 0 }}
        >
          <img
            src={event.bannerImg || event.img || "/images/default-event.jpg"}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/30 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent z-[1]" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-14 lg:pb-16">
        
        {/* Event Info */}
        <div
          className="max-w-2xl transition-all duration-500 ease-out"
          style={{
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating ? "translateY(20px)" : "translateY(0)",
          }}
        >
          {/* Category Badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-[#f2c737] text-black text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              <Ticket className="w-3.5 h-3.5" />
              {featuredEvent.category || "Event"}
            </span>
            {isSoldOut && (
              <span className="inline-flex items-center bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Sold Out
              </span>
            )}
            {!isSoldOut && ticketsLeft < 10 && (
              <span className="inline-flex items-center bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Only {ticketsLeft} left!
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            {featuredEvent.title || "Untitled Event"}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-white/70 text-sm sm:text-base mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#f2c737]" />
              <span>{featuredEvent.date || "Date TBA"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#f2c737]" />
              <span>{featuredEvent.venue || "Venue TBA"}</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleEventClick}
              disabled={isSoldOut}
              className={`font-semibold px-8 py-3.5 rounded-xl text-sm transition-all duration-300 ${
                isSoldOut
                  ? "bg-white/10 text-white/30 cursor-not-allowed"
                  : "bg-[#f2c737] text-black hover:bg-white hover:shadow-[0_0_30px_rgba(242,199,55,0.3)]"
              }`}
            >
              {isSoldOut
                ? "Sold Out"
                : featuredEvent.price === 0
                ? "Register Free"
                : `Book Now — ₹${featuredEvent.price}`}
            </button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-14 lg:bottom-16 right-4 sm:right-6 lg:right-8 flex items-center gap-3 z-20">
          <button
            onClick={prevSlide}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Slide Count */}
          <span className="text-white/60 text-sm font-medium tabular-nums min-w-[48px] text-center">
            {String(currentSlide + 1).padStart(2, "0")} / {String(events.length).padStart(2, "0")}
          </span>

          <button
            onClick={nextSlide}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="h-1 bg-white/10">
            <div
              className="h-full bg-[#f2c737] transition-all duration-500 ease-out"
              style={{ width: `${((currentSlide + 1) / events.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;