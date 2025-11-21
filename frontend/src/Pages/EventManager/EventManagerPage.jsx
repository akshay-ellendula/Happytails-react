import React, { useState, Suspense, useEffect } from "react";
import { useNavigate } from "react-router";
import { axiosInstance } from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";

// Page Components - Static imports for main pages prevent flickering
import Dashboard from "./Dashboard"; 
import Events from "./Events";
import Analytics from "./Analytics.jsx";
import Settings from "./Settings";
import CreateEvent from './CreateEvent.jsx';
import EditEvent from './EditEvent.jsx';

// Icons
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  BarChart3, 
  Settings as SettingsIcon,
  User,
  LogOut,
} from "lucide-react";

// Lazy load components - MUST BE DEFINED OUTSIDE THE COMPONENT
// If defined inside, they trigger unmount/remount on every parent render, causing infinite API loops.
const Tickets = React.lazy(() => import("./Tickets"));
const TicketDetails = React.lazy(() => import("./TicketDetails.jsx"));
const EditTicket = React.lazy(() => import("./EditTicket"));

const EventManagerPages = () => {
  const { signout } = useAuth();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState("dashboard");
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  // Keeping track of history for back navigation
  const [pageHistory, setPageHistory] = useState([]);
  
  // Profile State for Sidebar
  const [profile, setProfile] = useState({
    name: "Event Manager",
    email: "loading...",
    profilePic: null
  });

  // Fetch Profile Data for Sidebar - Runs once on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/eventManagers/profile/me');
        setProfile({
          name: res.data.userName || "Event Manager",
          email: res.data.email || "",
          profilePic: res.data.profilePic || null
        });
      } catch (error) {
        console.error("Failed to fetch sidebar profile:", error);
        setProfile(prev => ({ ...prev, email: "Error loading profile" }));
      }
    };
    fetchProfile();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    await signout(); // Calls auth context logout
    navigate('/service-login'); // Redirect to the service provider login
  };

  // Sidebar Configuration
  const sidebarItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard 
    },
    { 
      id: "events", 
      label: "Events", 
      icon: Calendar,
      // Highlight 'Events' tab when in create/edit modes
      activeMatches: ["events", "create-event", "edit-event"] 
    },
    { 
      id: "tickets", 
      label: "Tickets", 
      icon: Ticket,
      // Highlight 'Tickets' tab when viewing details/editing
      activeMatches: ["tickets", "ticket-details", "edit-ticket"] 
    },
    { 
      id: "analytics", 
      label: "Analytics", 
      icon: BarChart3 
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: SettingsIcon 
    },
  ];

  // Enhanced navigation with history tracking
  const handlePageChange = (page, data = null, type = null) => {
    // Push current state to history before moving
    setPageHistory(prev => [...prev, { page: currentPage, data: currentEvent || currentTicket }]);
    
    if (type === 'event' && data) {
      setCurrentEvent(data);
      setCurrentTicket(null);
    } else if (type === 'ticket' && data) {
      setCurrentTicket(data);
      setCurrentEvent(null);
    } else {
      setCurrentEvent(null);
      setCurrentTicket(null);
    }
    
    setCurrentPage(page);
  };

  // Render Page Logic
  const renderPage = () => {
    const pageConfig = {
      fallback: (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    };

    switch (currentPage) {
      case "dashboard": return <Dashboard setCurrentPage={handlePageChange} />;
      case "events": return <Events setCurrentPage={handlePageChange} />;
      case "tickets": 
        return (
          <Suspense fallback={pageConfig.fallback}>
            <Tickets setCurrentPage={handlePageChange} />
          </Suspense>
        );
      case "ticket-details":
        return (
          <Suspense fallback={pageConfig.fallback}>
            <TicketDetails setCurrentPage={handlePageChange} ticketData={currentTicket} />
          </Suspense>
        );
      case "edit-ticket":
        return (
          <Suspense fallback={pageConfig.fallback}>
            <EditTicket setCurrentPage={handlePageChange} ticketData={currentTicket} />
          </Suspense>
        );
      case "analytics": return <Analytics />;
      case "settings": return <Settings />;
      case "create-event": return <CreateEvent setCurrentPage={handlePageChange} />;
      case "edit-event": return <EditEvent setCurrentPage={handlePageChange} eventData={currentEvent} />;
      default: return <Dashboard setCurrentPage={handlePageChange} />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Dynamic Sidebar */}
      <div className="bg-[#1a1a1a] text-white w-64 p-4 flex flex-col transition-all duration-300">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🐾</span>
            <h1 className="text-xl font-bold tracking-wide">Happy Tails</h1>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              // Check if the item should be active based on current page or sub-pages
              const isActive = item.activeMatches 
                ? item.activeMatches.includes(currentPage) 
                : currentPage === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handlePageChange(item.id)}
                    className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-[#effe8b]/20 border-l-4 border-[#effe8b] text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <item.icon 
                      className={`w-5 h-5 transition-colors ${
                        isActive ? "text-[#effe8b]" : "text-gray-400 group-hover:text-white"
                      }`} 
                    />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Dynamic User Profile Footer */}
        <div className="pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              {profile.profilePic ? (
                 <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" title={profile.name}>{profile.name}</p>
              <p className="text-xs text-gray-500 truncate" title={profile.email}>{profile.email}</p>
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
        <div className="flex-1 overflow-auto bg-gray-50">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default EventManagerPages;