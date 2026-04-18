import React from "react";
import { useNavigate } from "react-router-dom";

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate(`/event/${event.id}`);
  };
  const ticketsLeft = event.total_tickets - event.tickets_sold;
  const isSoldOut = ticketsLeft === 0;
  
  return (
    <div className="bg-[#111] rounded-2xl overflow-hidden hover:scale-[1.02] transition-all cursor-pointer group">
      <div
        className="h-56 overflow-hidden relative"
        onClick={handleBookClick}
      >
        <img
          src={event.img}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
              SOLD OUT
            </span>
          </div>
        )}
        {!isSoldOut && ticketsLeft < 10 && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold">
            {ticketsLeft} left
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[#f2c737] transition-colors">{event.title}</h3>
        <p className="text-white/40 text-sm mb-1">{event.date}</p>
        <p className="text-white/60 text-sm font-medium mb-4">
          {event.venue}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-[#f2c737] font-bold">
            {event.price === 0 ? "Free Entry" : `₹${event.price}`}
          </span>
          <button
            onClick={handleBookClick}
            disabled={isSoldOut}
            className={`font-semibold px-4 py-2 rounded-lg text-sm transition-colors ${
              isSoldOut
                ? "bg-white/10 text-white/30 cursor-not-allowed"
                : "bg-[#f2c737] text-black hover:bg-white"
            }`}
          >
            {isSoldOut
              ? "Sold Out"
              : event.price === 0
              ? "Register"
              : "Book Now"}
          </button>
        </div>
        {!isSoldOut && ticketsLeft > 0 && ticketsLeft <= 20 && (
          <div className="mt-3">
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-[#f2c737] h-1.5 rounded-full"
                style={{
                  width: `${(ticketsLeft / event.total_tickets) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-white/30 mt-1.5">
              Only {ticketsLeft} tickets left
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;