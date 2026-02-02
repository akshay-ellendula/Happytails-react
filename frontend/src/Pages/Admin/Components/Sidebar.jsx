import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signout } = useAuth();

  const menu = [
    { label: "Dashboard", to: "/admin/dashboard", icon: "📊" },
    { label: "Users", to: "/admin/users", icon: "👥" },
    { label: "Shop Managers", to: "/admin/vendors", icon: "🏪" },
    { label: "Event Managers", to: "/admin/event-managers", icon: "🎪" },
    { label: "Events", to: "/admin/events", icon: "📅" },
    { label: "Products", to: "/admin/products", icon: "🛍️" },
    { label: "Orders", to: "/admin/orders", icon: "📦" },
  ];

  const handleLogout = async () => {
    try {
      await signout();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
      alert("Logout failed – please try again");
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-yellow-400 to-yellow-500 shadow-2xl p-6 fixed left-0 top-0 border-r border-yellow-600">
      {/* Logo Section */}
      <div className="mb-10 px-2">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Happy Tails</h1>
          <p className="text-sm text-gray-700">Admin Dashboard</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 mb-8">
        {menu.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
              ${pathname === item.to
                ? "bg-gradient-to-r from-white to-gray-100 text-yellow-700 shadow-lg font-semibold"
                : "text-gray-700 hover:bg-yellow-300 hover:text-gray-800 hover:shadow-md"
              }
            `}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {pathname === item.to && (
              <div className="ml-auto w-2 h-2 rounded-full bg-yellow-700"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={handleLogout}
          className="
            flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl
            bg-gradient-to-r from-red-600 to-red-700 text-white font-medium
            hover:from-red-700 hover:to-red-800 hover:shadow-lg
            transition-all duration-300 shadow-md
          "
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          Logout
        </button>
      </div>


    </aside>
  );
}