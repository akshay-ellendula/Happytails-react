import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, ArrowRight, Tag } from "lucide-react";

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate(`/event/${event.id}`);
  };

  const ticketsLeft = event.total_tickets - event.tickets_sold;
  const isSoldOut = ticketsLeft === 0;
  const isSellingFast = !isSoldOut && ticketsLeft <= 20;

  return (
    <div
      onClick={handleBookClick}
      className="group relative rounded-[24px] overflow-hidden cursor-pointer h-[420px] flex flex-col justify-end bg-[#0A0A0A] border border-white/5 transition-all duration-500 hover:border-[#f2c737]/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_-20px_rgba(242,199,55,0.2)]"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Background Image with Hover Zoom */}
      <div className="absolute inset-0 bg-[#050505]">
        <img
          src={event.img || "/images/default-event.jpg"}
          alt={event.title}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out"
        />
      </div>

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Top Section */}
      <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
        <div className="flex flex-col gap-2">
          {/* Category Badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 text-white px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
            <Tag size={12} className="text-[#f2c737]" />
            {event.category}
          </span>
          
          {/* Status Badges */}
          {isSoldOut ? (
            <span className="inline-flex items-center bg-red-500/90 backdrop-blur-md border border-red-400/20 text-white px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              Sold Out
            </span>
          ) : isSellingFast ? (
            <span className="inline-flex items-center bg-orange-500/90 backdrop-blur-md border border-orange-400/20 text-white px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(249,115,22,0.4)] animate-pulse">
              Selling Fast
            </span>
          ) : null}
        </div>

        {/* Price Tag */}
        <div className="flex flex-col items-end">
          <span className="bg-[#f2c737] text-black px-4 py-2 rounded-full font-extrabold text-sm shadow-[0_8px_20px_rgba(242,199,55,0.4)] transform group-hover:scale-[1.05] group-hover:-rotate-2 transition-transform duration-300">
            {event.price === 0 ? "FREE" : `₹${event.price}`}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 p-5 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
        
        {/* Title */}
        <h3 className="text-white font-bold text-2xl mb-4 leading-[1.2] group-hover:text-[#f2c737] transition-colors duration-300 line-clamp-2 drop-shadow-md">
          {event.title}
        </h3>

        {/* Date & Location */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-[#f2c737]" />
            </div>
            <span className="text-sm font-medium tracking-wide truncate">{event.date}</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
              <MapPin className="w-3.5 h-3.5 text-[#f2c737]" />
            </div>
            <span className="text-sm font-medium tracking-wide truncate">{event.venue}</span>
          </div>
        </div>

        {/* Progress Bar for Selling Fast */}
        {isSellingFast && (
          <div className="mb-5 bg-black/40 rounded-xl p-3 border border-white/5 backdrop-blur-md">
             <div className="flex justify-between items-center text-xs font-semibold mb-2">
                <span className="text-orange-400 uppercase tracking-wider text-[10px]">Tickets Left</span>
                <span className="bg-[#f2c737] text-black px-2 py-0.5 rounded font-bold text-[10px]">{ticketsLeft}</span>
             </div>
             <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 to-[#f2c737] h-full rounded-full relative"
                  style={{ width: `${(ticketsLeft / event.total_tickets) * 100}%` }}
                >
                   <div className="absolute inset-0 bg-white/30 w-full animate-pulse" />
                </div>
             </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleBookClick();
          }}
          disabled={isSoldOut}
          className={`relative w-full overflow-hidden rounded-xl py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
            isSoldOut
              ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
              : "bg-white/10 text-white border border-white/20 hover:bg-[#f2c737] hover:text-black hover:shadow-[0_0_25px_rgba(242,199,55,0.4)] group-hover:border-[#f2c737] backdrop-blur-md"
          }`}
        >
          <span className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1">
            {isSoldOut ? "Sold Out" : event.price === 0 ? "Claim Spot" : "Book Tickets"}
          </span>
          {!isSoldOut && (
             <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:translate-x-1 group-hover:ml-0 transition-all duration-300 ease-out" />
          )}
        </button>

      </div>
    </div>
  );
};

export default EventCard;