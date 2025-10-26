import { useState, useEffect } from "react";

const HeroBanner = ({ events }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    if (events.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [events.length]);

  if (events.length === 0) {
    return (
      <section className="bg-white py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">No featured events available</p>
        </div>
      </section>
    );
  }

  const featuredEvent = events[currentSlide];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
  };

  return (
    <section className="bg-white py-8 md:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Desktop Navigation Arrows - Outside Container */}
        <button
          onClick={prevSlide}
          className="hidden lg:flex absolute -left-16 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-[#1a1a1a] w-14 h-14 rounded-full items-center justify-center transition-all shadow-xl border border-gray-300 z-10"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="hidden lg:flex absolute -right-16 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-[#1a1a1a] w-14 h-14 rounded-full items-center justify-center transition-all shadow-xl border border-gray-300 z-10"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="flex flex-col lg:flex-row items-center justify-between">
          
          {/* Content Section */}
          <div className="flex-1 w-full lg:w-auto text-center lg:text-left order-2 lg:order-1">
            <p className="text-[#1a1a1a] text-sm font-semibold mb-2">
              {featuredEvent.date}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mb-4 leading-tight">
              {featuredEvent.title}
            </h1>
            <p className="text-[#1a1a1a] text-base sm:text-lg mb-6">
              {featuredEvent.venue}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <span className="text-[#1a1a1a] font-bold text-lg">
                {featuredEvent.price}
              </span>
              <button className="bg-[#effe8b] text-[#1a1a1a] font-bold px-8 py-3 rounded-full hover:bg-[#effe8b] transition transform hover:scale-105 text-sm sm:text-base whitespace-nowrap shadow-md">
                {featuredEvent.buttonText}
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center lg:justify-start space-x-2 mt-6 lg:mt-8">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                    index === currentSlide ? "bg-[#1a1a1a]" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Image Carousel Section */}
          <div className="w-full lg:w-auto mb-8 lg:mb-0 order-1 lg:order-2 relative">
            <div className="relative mx-auto lg:mx-0">
              <div className="w-full max-w-md lg:w-72 xl:w-80 h-64 sm:h-80 lg:h-80 xl:h-96 bg-white rounded-3xl shadow-2xl overflow-hidden lg:transform lg:rotate-3 relative">
                {/* Image with fallback to emoji */}
                <div className="absolute inset-0">
                  <img
                    src={featuredEvent.bannerImg || featuredEvent.img}
                    alt={featuredEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <button
                onClick={prevSlide}
                className="lg:hidden absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-[#1a1a1a] w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl border border-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="lg:hidden absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-[#1a1a1a] w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl border border-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;