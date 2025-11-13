import React, { useState, Suspense } from "react";
import Events from "./Events";
import Analytics from "./Analytics";
import Settings from "./Settings";
import CreateEvent from './CreateEvent.jsx';
import EditEvent from './EditEvent.jsx';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  Ticket, 
  BarChart3, 
  Settings as SettingsIcon,
  User,
  LogOut,
  ArrowLeft
} from "lucide-react";

const EventManagerPages = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [currentEvent, setCurrentEvent] = useState(null);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [pageHistory, setPageHistory] = useState([]);

  // Lazy load components
  const Dashboard = React.lazy(() => import("./Dashboard"));
  const Tickets = React.lazy(() => import("./Tickets"));
  const TicketDetails = React.lazy(() => import("./TicketDetails.jsx"));
  const EditTicket = React.lazy(() => import("./EditTicket"));

  // Enhanced navigation with history tracking
  const handlePageChange = (page, data = null, type = null) => {
    // Add current page to history before navigating
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

  // Handle back navigation
  const handleBack = () => {
    if (pageHistory.length > 0) {
      const previous = pageHistory[pageHistory.length - 1];
      setCurrentPage(previous.page);
      if (previous.data) {
        if (previous.page === 'edit-event' || previous.page === 'events') {
          setCurrentEvent(previous.data);
        } else if (previous.page === 'ticket-details' || previous.page === 'edit-ticket') {
          setCurrentTicket(previous.data);
        }
      }
      setPageHistory(prev => prev.slice(0, -1));
    } else {
      // Default fallback
      setCurrentPage("dashboard");
    }
  };

  // Render appropriate page header
  const renderHeader = () => {
    switch (currentPage) {
      case "ticket-details":
        return {
          title: "Ticket Details",
          subtitle: `Ticket ID: ${currentTicket?.id || ''}`,
          showBack: true
        };
      case "edit-ticket":
        return {
          title: "Edit Ticket",
          subtitle: `Ticket ID: ${currentTicket?.id || ''}`,
          showBack: true
        };
      case "edit-event":
        return {
          title: "Edit Event",
          subtitle: currentEvent?.title || "Edit Event Details",
          showBack: true
        };
      case "create-event":
        return {
          title: "Create Event",
          subtitle: "Create a new event",
          showBack: true
        };
      case "events":
        return {
          title: "Events",
          subtitle: "Manage your events",
          showBack: false
        };
      case "tickets":
        return {
          title: "Tickets",
          subtitle: "Manage ticket sales",
          showBack: false
        };
      case "analytics":
        return {
          title: "Analytics",
          subtitle: "View event insights",
          showBack: false
        };
      case "settings":
        return {
          title: "Settings",
          subtitle: "Manage your account",
          showBack: false
        };
      default:
        return {
          title: "Dashboard",
          subtitle: "Event overview and quick actions",
          showBack: false
        };
    }
  };

  const renderPage = () => {
    const pageConfig = {
      fallback: (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    };

    switch (currentPage) {
      case "dashboard":
        return (
          <Suspense fallback={pageConfig.fallback}>
            <Dashboard setCurrentPage={handlePageChange} />
          </Suspense>
        );
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
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      case "create-event":
        return <CreateEvent setCurrentPage={handlePageChange} />;
      case "edit-event":
        return <EditEvent setCurrentPage={handlePageChange} eventData={currentEvent} />;
      default:
        return (
          <Suspense fallback={pageConfig.fallback}>
            <Dashboard setCurrentPage={handlePageChange} />
          </Suspense>
        );
    }
  };

  const header = renderHeader();

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="bg-[#1a1a1a] text-white w-64 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐾</span>
            <h1 className="text-xl font-bold">Happy Tails</h1>
          </div>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handlePageChange("dashboard")}
                className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                  currentPage === "dashboard"
                    ? "bg-[rgba(239,254,139,0.2)] border-l-4 border-[#effe8b] text-white"
                    : ""
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handlePageChange("events")}
                className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                  currentPage === "events"
                    ? "bg-[rgba(239,254,139,0.2)] border-l-4 border-[#effe8b] text-white"
                    : ""
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Events</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handlePageChange("tickets")}
                className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                  currentPage === "tickets" || 
                  currentPage === "ticket-details" || 
                  currentPage === "edit-ticket"
                    ? "bg-[rgba(239,254,139,0.2)] border-l-4 border-[#effe8b] text-white"
                    : ""
                }`}
              >
                <Ticket className="w-5 h-5" />
                <span>Tickets</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handlePageChange("analytics")}
                className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                  currentPage === "analytics"
                    ? "bg-[rgba(239,254,139,0.2)] border-l-4 border-[#effe8b] text-white"
                    : ""
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handlePageChange("settings")}
                className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                  currentPage === "settings"
                    ? "bg-[rgba(239,254,139,0.2)] border-l-4 border-[#effe8b] text-white"
                    : ""
                }`}
              >
                <SettingsIcon className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 p-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Event Manager</p>
              <p className="text-sm text-gray-400">admin@happytails.com</p>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default EventManagerPages;