import React, { useState, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";
import { useAuth } from "../../hooks/useAuth";

// Page Components - Static imports for main pages prevent flickering
import Dashboard from "./Dashboard";
import Events from "./Events";
import Analytics from "./Analytics.jsx";
import Settings from "./Settings";
import CreateEvent from "./CreateEvent.jsx";
import EditEvent from "./EditEvent.jsx";
import EventDetailsView from "./EventDetailsView.jsx";
import EventPublicPreview from "./EventPublicPreview.jsx";
import Reviews from "./Reviews.jsx"; 
import EmailLogs from "./EmailLogs.jsx"; // <-- IMPORT EMAIL LOGS

// Icons
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  BarChart3,
  Settings as SettingsIcon,
  User,
  LogOut,
  Star,
  Mail // <-- IMPORT MAIL ICON
} from "lucide-react";

// Lazy load components - MUST BE DEFINED OUTSIDE THE COMPONENT
const Tickets = React.lazy(() => import("./Tickets"));
const TicketDetails = React.lazy(() => import("./TicketDetails.jsx"));
const EditTicket = React.lazy(() => import("./EditTicket"));

const EventManagerPages = () => {
  const { signout } = useAuth();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);

  // Profile State for Sidebar
  const [profile, setProfile] = useState({
    name: "Event Manager",
    email: "loading...",
    profilePic: null,
  });

  // Fetch Profile Data for Sidebar
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/eventManagers/profile/me");
        setProfile({
          name: res.data.userName || "Event Manager",
          email: res.data.email || "",
          profilePic: res.data.profilePic || null,
        });
      } catch (error) {
        console.error("Failed to fetch sidebar profile:", error);
        setProfile((prev) => ({ ...prev, email: "Error loading profile" }));
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await signout(); 
    navigate("/service-login"); 
  };

  // Sidebar Configuration
  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "events",
      label: "Events",
      icon: Calendar,
      activeMatches: ["events", "create-event", "edit-event"],
    },
    {
      id: "tickets",
      label: "Tickets",
      icon: Ticket,
      activeMatches: ["tickets", "ticket-details", "edit-ticket"],
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: Star, // <-- NEW REVIEWS TAB
    },
    {
      id: "emailLogs",
      label: "Email Logs",
      icon: Mail, 
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
    },
  ];

  const handlePageChange = (page, data = null, type = null) => {
    setPageHistory((prev) => [
      ...prev,
      { page: currentPage, data: currentEvent || currentTicket },
    ]);

    if (type === "event" && data) {
      setCurrentEvent(data);
      setCurrentTicket(null);
    } else if (type === "ticket" && data) {
      setCurrentTicket(data);
      setCurrentEvent(null);
    } else {
      setCurrentEvent(null);
      setCurrentTicket(null);
    }

    setCurrentPage(page);
  };

  const renderPage = () => {
    const pageConfig = {
      fallback: (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-black border-t-[#f2c737] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-bold">Loading...</p>
          </div>
        </div>
      ),
    };

    switch (currentPage) {
      case "dashboard":
        return <Dashboard setCurrentPage={handlePageChange} />;
      case "events":
        return <Events setCurrentPage={handlePageChange} />;
      case "tickets":
        return (
          <Suspense fallback={pageConfig.fallback}>
            <Tickets setCurrentPage={handlePageChange} />
          </Suspense>
        );
      case "ticket-details":
        return (
          <Suspense fallback={pageConfig.fallback}>
            <TicketDetails
              setCurrentPage={handlePageChange}
              ticketData={currentTicket}
            />
          </Suspense>
        );
      case "edit-ticket":
        return (
          <Suspense fallback={pageConfig.fallback}>
            <EditTicket
              setCurrentPage={handlePageChange}
              ticketData={currentTicket}
            />
          </Suspense>
        );
      case "reviews": // <-- NEW CASE FOR REVIEWS
        return <Reviews />;
      case "emailLogs":
        return <EmailLogs />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      case "create-event":
        return <CreateEvent setCurrentPage={handlePageChange} />;
      case "edit-event":
        return (
          <EditEvent
            setCurrentPage={handlePageChange}
            eventData={currentEvent}
          />
        );
      case "event-details":
        return (
          <EventDetailsView 
            event={currentEvent} 
            setCurrentPage={handlePageChange} 
          />
        );
      case "event-public-preview":
        return (
          <EventPublicPreview 
            event={currentEvent} 
            setCurrentPage={handlePageChange} 
          />
        );
      default:
        return <Dashboard setCurrentPage={handlePageChange} />;
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex overflow-hidden">
      {/* Dynamic Sidebar matched to Admin UI */}
      <div className="w-64 h-full flex-shrink-0 bg-gradient-to-b from-yellow-400 to-yellow-500 shadow-2xl flex flex-col z-20 border-r border-yellow-600 transition-all duration-300 relative">
        <div className="p-6 pb-2">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white p-2 rounded-xl shadow-sm">
               <span className="text-2xl drop-shadow-sm">🐾</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Happy Tails</h1>
              <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider">Event Manager</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = item.activeMatches
                ? item.activeMatches.includes(currentPage)
                : currentPage === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handlePageChange(item.id)}
                    className={`w-full text-left flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                      isActive
                        ? "bg-gradient-to-r from-white to-yellow-50 text-yellow-800 shadow-md font-bold"
                        : "text-yellow-900 hover:bg-yellow-300 hover:text-black font-semibold"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? "text-yellow-600 scale-110" : "text-yellow-800 group-hover:scale-110"
                      }`}
                    />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-yellow-600 shadow-[0_0_8px_rgba(202,138,4,0.8)]"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Dynamic User Profile Footer */}
        <div className="p-4 border-t border-yellow-500/30 bg-yellow-400 mt-auto">
          <div className="flex items-center space-x-3 px-3 py-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/50 shadow-sm hover:bg-white/60 transition-colors">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-yellow-200 shadow-sm overflow-hidden flex-shrink-0">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900 truncate" title={profile.name}>
                {profile.name}
              </p>
              <p className="text-[11px] font-medium text-gray-700 truncate" title={profile.email}>
                {profile.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500 hover:text-white text-red-600 rounded-xl transition-colors shadow-sm bg-white/80 backdrop-blur-sm flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <div className="flex-1 h-full overflow-y-auto bg-gray-50/50">{renderPage()}</div>
      </div>
    </div>
  );
};

export default EventManagerPages;