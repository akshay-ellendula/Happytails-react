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
    <div className="bg-white rounded-2xl overflow-hidden hover:transform hover:scale-105 transition cursor-pointer border-2 border-transparent shadow-sm hover:shadow-lg">
      <div
        className="h-64 flex items-center justify-center bg-gray-100 overflow-hidden relative"
        onClick={handleBookClick}
      >
        <img
          src={event.img}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        {isSoldOut && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">
              SOLD OUT
            </span>
          </div>
        )}
        {!isSoldOut && ticketsLeft < 10 && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {ticketsLeft} left
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-[#1a1a1a] font-bold text-lg mb-2">{event.title}</h3>
        <p className="text-[#1a1a1a] text-sm mb-2">{event.date}</p>
        <p className="text-[#1a1a1a] text-sm font-semibold mb-3">
          {event.venue}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-[#1a1a1a] font-bold">
            {event.price === 0 ? "Free Entry" : `₹${event.price} onwards`}
          </span>
          <button
            onClick={handleBookClick}
            disabled={isSoldOut}
            className={`font-bold px-4 py-2 rounded-full text-sm transition ${
              isSoldOut
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-[#effe8b] text-[#1a1a1a] hover:bg-black hover:text-white"
            }`}
          >
            {isSoldOut
              ? "Sold Out"
              : event.ticketPrice === 0
              ? "Register Now"
              : "Book tickets"}
          </button>
        </div>
        {!isSoldOut && ticketsLeft > 0 && ticketsLeft <= 20 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(ticketsLeft / event.total_tickets) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Only {ticketsLeft} tickets left
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
