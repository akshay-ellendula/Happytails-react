import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroBanner = ({ events }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState("right");
  const navigate = useNavigate();

  useEffect(() => {
    if (events.length === 0) return;

    const interval = setInterval(() => {
      goToSlide((currentSlide + 1) % events.length, "right");
    }, 5000);
    return () => clearInterval(interval);
  }, [events.length, currentSlide]);

  const goToSlide = (index, direction) => {
    if (isAnimating) return;
    setSlideDirection(direction);
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
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
    goToSlide((currentSlide + 1) % events.length, "right");
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + events.length) % events.length, "left");
  };

  const slideStyle = {
    transition: "transform 0.4s ease, opacity 0.4s ease",
    transform: isAnimating
      ? `translateX(${slideDirection === "right" ? "-40px" : "40px"})`
      : "translateX(0)",
    opacity: isAnimating ? 0 : 1,
  };

  const imageStyle = {
    transition: "transform 0.5s ease, opacity 0.5s ease",
    transform: isAnimating
      ? `translateX(${slideDirection === "right" ? "40px" : "-40px"}) scale(0.95)`
      : "translateX(0) scale(1)",
    opacity: isAnimating ? 0 : 1,
  };

  return (
    <section className="relative bg-[#050505] overflow-hidden">
      
      {/* Blurred background image for atmosphere */}
      <div className="absolute inset-0 z-0 transition-opacity duration-700">
        <img
          src={featuredEvent.bannerImg || featuredEvent.img || "/images/default-event.jpg"}
          alt=""
          className="w-full h-full object-cover opacity-[0.08] blur-2xl scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-[#050505]/60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center min-h-[500px] lg:min-h-[520px] py-12 lg:py-16">

          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            className="hidden lg:flex flex-shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all mr-8"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-10 lg:gap-16">
            
            {/* Left: Event Info */}
            <div className="flex-1 w-full text-center lg:text-left order-2 lg:order-1" style={slideStyle}>
              <div className="inline-flex items-center text-[#f2c737] text-sm font-semibold mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{featuredEvent.date || "Date TBA"}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold text-white mb-5 leading-[1.15]">
                {featuredEvent.title || "Untitled Event"}
              </h1>

              <div className="flex items-center justify-center lg:justify-start text-white/60 text-base mb-6">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{featuredEvent.venue || "Venue TBA"}</span>
              </div>

              <p className="text-[#f2c737] font-bold text-lg mb-6">
                {featuredEvent.price === 0
                  ? "Free Entry"
                  : `₹${featuredEvent.price} onwards`}
              </p>

              <button
                onClick={handleEventClick}
                className="bg-white text-black font-semibold px-8 py-3.5 rounded-xl hover:bg-[#f2c737] transition-colors text-sm"
              >
                Book tickets
              </button>
            </div>

            {/* Right: Image Card */}
            <div className="w-full max-w-xs sm:max-w-sm lg:max-w-[340px] xl:max-w-[380px] flex-shrink-0 order-1 lg:order-2" style={imageStyle}>
              <div
                onClick={handleEventClick}
                className="relative cursor-pointer group"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                  <div className="rounded-xl overflow-hidden aspect-[4/5]">
                    <img
                      src={
                        featuredEvent.bannerImg ||
                        featuredEvent.img ||
                        "/images/default-event.jpg"
                      }
                      alt={featuredEvent.title || "Event"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile navigation arrows */}
              <div className="flex lg:hidden justify-center gap-4 mt-6">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            className="hidden lg:flex flex-shrink-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all ml-8"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 pb-10">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index, index > currentSlide ? "right" : "left")}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? "bg-white w-6" : "bg-white/20 w-2"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;