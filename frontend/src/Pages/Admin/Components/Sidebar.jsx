import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signout } = useAuth();

  const menu = [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Users", to: "/admin/users" },
    { label: "Shop Managers", to: "/admin/vendors" },
    { label: "Event Managers", to: "/admin/event-managers" },
    { label: "Events", to: "/admin/events" },
    { label: "Products", to: "/admin/products" },
    { label: "Orders", to: "/admin/orders" },
    { label: "Reviews", to: "/admin/reviews" },
    { label: "Analytics", to: "/admin/analytics" },
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
    <aside className="w-64 min-h-screen bg-gradient-to-b from-amber-300 via-yellow-300 to-amber-400 shadow-2xl p-6 fixed left-0 top-0 border-r border-amber-500/60">
      {/* Logo Section */}
      <div className="mb-8 px-2">
        <div className="mb-2">
          <p className="text-xs uppercase tracking-[0.18em] text-amber-900/70 font-semibold mb-2">
            Platform Admin
          </p>
          <h1 className="text-2xl font-black text-gray-900">Happy Tails</h1>
          <p className="text-sm text-gray-800/80">Admin Dashboard</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 mb-8">
        {menu.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`
              flex items-center px-4 py-3 rounded-xl transition-all duration-300 group
              ${pathname === item.to
                ? "bg-white text-amber-700 shadow-[0_10px_24px_rgba(120,53,15,0.2)] font-semibold"
                : "text-amber-900/85 hover:bg-amber-200/70 hover:text-amber-950 hover:shadow-md"
              }
            `}
          >
            <span className="font-medium">{item.label}</span>
            {pathname === item.to && (
              <div className="ml-auto w-2 h-2 rounded-full bg-amber-700"></div>
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