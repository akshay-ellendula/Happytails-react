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
import Reviews from "./Reviews.jsx"; // <-- IMPORT REVIEWS

// Icons
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  BarChart3,
  Settings as SettingsIcon,
  User,
  LogOut,
  Star // <-- IMPORT STAR ICON FOR REVIEWS
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
      default:
        return <Dashboard setCurrentPage={handlePageChange} />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Dynamic Sidebar */}
      <div className="bg-[#1a1a1a] text-white w-64 p-4 flex flex-col transition-all duration-300 shadow-[4px_0_15px_rgba(0,0,0,0.1)] z-10">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center space-x-3">
            <span className="text-2xl drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">🐾</span>
            <h1 className="text-xl font-bold tracking-wide text-[#f2c737]">Happy Tails</h1>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = item.activeMatches
                ? item.activeMatches.includes(currentPage)
                : currentPage === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handlePageChange(item.id)}
                    className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-[#effe8b]/20 border-l-4 border-[#effe8b] text-white font-bold"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white font-medium"
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-[#effe8b]"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Dynamic User Profile Footer */}
        <div className="pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-700 border-2 border-[#effe8b] overflow-hidden">
              {profile.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white truncate" title={profile.name}>
                {profile.name}
              </p>
              <p className="text-xs text-gray-400 truncate" title={profile.email}>
                {profile.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-900/30 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto bg-gray-50">{renderPage()}</div>
      </div>
    </div>
  );
};

export default EventManagerPages;