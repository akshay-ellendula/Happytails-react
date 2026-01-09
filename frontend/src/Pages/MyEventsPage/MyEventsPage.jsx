import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Ticket, Loader2, ArrowRight, Download } from "lucide-react";
import { axiosInstance } from "../../utils/axios";
import Header from "../../components/Header";
import MobileMenu from "../../components/MobileMenu";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import jsPDF from "jspdf";

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

  // Helper to load image for PDF (Handles QR Code & Event Thumbnails)
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = (e) => {
        console.warn("Could not load image for PDF:", url);
        resolve(null); // Return null so PDF generation doesn't break
      };
    });
  };

  const downloadTicket = async (ticket, event) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- THEME COLORS ---
    const colorDark = [26, 26, 26];    // #1a1a1a
    const colorLime = [239, 254, 139]; // #effe8b
    const colorGray = [100, 100, 100];

    // --- 1. HEADER BRANDING ---
    // Dark background strip
    doc.setFillColor(...colorDark);
    doc.rect(0, 0, pageWidth, 40, "F");

    // "HappyTails" Logo/Text
    doc.setTextColor(...colorLime);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("HappyTails", 20, 28);

    // "Entry Ticket" Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("OFFICIAL ENTRY TICKET", pageWidth - 20, 28, { align: "right" });

    // Accent Line
    doc.setDrawColor(...colorLime);
    doc.setLineWidth(2);
    doc.line(0, 41, pageWidth, 41);

    // --- 2. MAIN TICKET CARD ---
    // Draw a rounded box mimicking the UI cards
    const cardY = 60;
    const cardHeight = 140;
    
    doc.setDrawColor(...colorDark);
    doc.setLineWidth(1);
    doc.roundedRect(15, cardY, pageWidth - 30, cardHeight, 5, 5, "S");

    // --- 3. EVENT TITLE & DETAILS (Left Side) ---
    doc.setTextColor(...colorDark);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    
    // Title wraps if too long
    const titleLines = doc.splitTextToSize(event.title, 110);
    doc.text(titleLines, 25, cardY + 20);
    
    let currentY = cardY + 20 + (titleLines.length * 10);

    // Date & Venue
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorGray);
    doc.text("DATE & TIME", 25, currentY + 10);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colorDark);
    doc.text(formatDate(event.date_time), 25, currentY + 18);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorGray);
    doc.text("VENUE", 25, currentY + 30);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colorDark);
    const venueLines = doc.splitTextToSize(`${event.venue}, ${event.location}`, 100);
    doc.text(venueLines, 25, currentY + 38);

    // Ticket Details Table-ish layout
    const detailsY = currentY + 55;
    
    // Grid Lines for details
    doc.setDrawColor(230, 230, 230);
    doc.line(25, detailsY, 130, detailsY); // Top line
    doc.line(25, detailsY + 25, 130, detailsY + 25); // Bottom line

    // Columns: Type, Qty, Price
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorGray);
    doc.text("TICKET ID", 25, detailsY + 8);
    doc.text("QUANTITY", 80, detailsY + 8);
    doc.text("PRICE", 110, detailsY + 8);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colorDark);
    doc.text(ticket.ticketId, 25, detailsY + 18);
    doc.text(`${ticket.numberOfTickets}`, 80, detailsY + 18);
    doc.text(`Rs. ${ticket.price}`, 110, detailsY + 18);

    // --- 4. QR CODE AREA (Right Side) ---
    // Right panel background
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(pageWidth - 75, cardY + 5, 55, cardHeight - 10, 3, 3, "F");

    try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.ticketId}`;
        const qrImage = await loadImage(qrUrl);
        if (qrImage) {
            doc.addImage(qrImage, "PNG", pageWidth - 72.5, cardY + 20, 50, 50);
        }
    } catch (err) {
        console.error("QR Load Error");
    }

    doc.setFontSize(10);
    doc.setTextColor(...colorGray);
    doc.text("Scan at entry", pageWidth - 48, cardY + 75, { align: "center" });

    // Status Badge
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    if (ticket.status) {
        doc.setTextColor(0, 150, 0); // Green
        doc.text("CONFIRMED", pageWidth - 48, cardY + 90, { align: "center" });
    } else {
        doc.setTextColor(200, 0, 0); // Red
        doc.text("CANCELLED", pageWidth - 48, cardY + 90, { align: "center" });
    }
    
    // Booking Name
    doc.setFontSize(9);
    doc.setTextColor(...colorGray);
    doc.setFont("helvetica", "normal");
    doc.text("Booked by:", pageWidth - 48, cardY + 105, { align: "center" });
    doc.setTextColor(...colorDark);
    doc.setFont("helvetica", "bold");
    doc.text(ticket.contactName || "Guest", pageWidth - 48, cardY + 112, { align: "center" });

    // --- 5. INSTRUCTIONS ---
    const instY = cardY + cardHeight + 20;
    
    // Yellow Warning Strip
    doc.setFillColor(...colorLime);
    doc.rect(15, instY, 5, 45, "F"); // Small vertical strip

    doc.setFontSize(14);
    doc.setTextColor(...colorDark);
    doc.setFont("helvetica", "bold");
    doc.text("Important Instructions", 25, instY + 6);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    const instructions = [
        "Please present this ticket (digital or printed) at the entrance.",
        "Valid government ID proof is mandatory for verification.",
        "Gates open 30 minutes prior to the event start time.",
        "Alcohol and illegal substances are strictly prohibited.",
        "Tickets are non-transferable and non-refundable."
    ];

    let lineY = instY + 16;
    instructions.forEach((text) => {
        doc.text(`• ${text}`, 25, lineY);
        lineY += 7;
    });

    // --- 6. FOOTER ---
    doc.setDrawColor(200, 200, 200);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Ticket Generated on ${new Date().toLocaleDateString()}`, 20, pageHeight - 12);
    doc.text("www.happytails.com", pageWidth - 20, pageHeight - 12, { align: "right" });

    doc.save(`${ticket.ticketId}_Ticket.pdf`);
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

                          <div className="mt-4 flex flex-wrap gap-3">
                            <Link 
                              to={`/event/${event._id}`}
                              className="inline-flex items-center text-[#1a1a1a] font-bold hover:underline"
                            >
                              View Event Details <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>

                            {/* Download Button */}
                            <button
                                onClick={() => downloadTicket(ticket, event)}
                                className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-[#1a1a1a] rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Ticket
                            </button>
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