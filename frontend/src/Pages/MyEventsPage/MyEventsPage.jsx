import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Ticket, Loader2, ArrowRight } from "lucide-react";
import { axiosInstance } from "../../utils/axios";
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";

export default function MyEventsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axiosInstance.get("/tickets/my-tickets");
        setTickets(res.data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-[#effe8b] font-outfit min-h-screen flex flex-col">
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex flex-col lg:flex-row gap-8 mx-4 md:mx-8 lg:mx-20 mt-12 mb-20 grow">
        <Sidebar />
        
        <main className="flex-1">
          <section className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 min-h-[600px]">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-8">
              My Events & Tickets
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin w-10 h-10 text-[#1a1a1a]" />
              </div>
            ) : tickets.length > 0 ? (
              <div className="space-y-6">
                {tickets.map((ticket) => {
                  const event = ticket.eventId;
                  if (!event) return null;

                  return (
                    <div
                      key={ticket._id}
                      className="border-2 border-black rounded-2xl p-5 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 bg-white"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        
                        {/* 1. Event Image */}
                        <div className="w-full lg:w-40 h-40 shrink-0 rounded-xl overflow-hidden border-2 border-black">
                          <img
                            src={event.images?.thumbnail || "/images/default-event.jpg"}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* 2. Event Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="text-xl md:text-2xl font-bold text-[#1a1a1a] line-clamp-1">
                                {event.title}
                              </h3>
                              {/* Status Badge for Mobile */}
                              <span className={`lg:hidden px-2 py-1 rounded text-[10px] font-bold border border-black ${
                                ticket.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {ticket.status ? 'CONFIRMED' : 'CANCELLED'}
                              </span>
                            </div>

                            <div className="space-y-1.5 text-gray-700 mt-2 text-sm md:text-base">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">
                                  {formatDate(event.date_time)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="line-clamp-1">{event.venue}, {event.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4" />
                                <span>
                                  {ticket.numberOfTickets} Ticket(s)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <Link 
                              to={`/event/${event._id}`}
                              className="inline-flex items-center text-[#1a1a1a] font-bold hover:underline"
                            >
                              View Event Details <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                          </div>
                        </div>

                        {/* 3. QR Code Section (Inside Card) */}
                        <div className="shrink-0 flex flex-row lg:flex-col items-center justify-between lg:justify-center p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                            <div className="text-left lg:text-center mr-4 lg:mr-0 lg:mb-2">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Entry Pass</p>
                                <span className={`hidden lg:inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border border-black ${
                                    ticket.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {ticket.status ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                            
                            {/* QR Code Image */}
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticketId}`}
                                alt="Ticket QR"
                                className="w-24 h-24 object-contain mix-blend-multiply"
                            />
                            
                            <p className="hidden lg:block text-[10px] text-gray-400 mt-2 font-mono">
                                {ticket.ticketId}
                            </p>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No tickets yet</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't booked any events.</p>
                <Link
                  to="/events"
                  className="px-8 py-3 bg-[#1a1a1a] text-white rounded-full font-bold hover:bg-opacity-90 transition"
                >
                  Explore Events
                </Link>
              </div>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}