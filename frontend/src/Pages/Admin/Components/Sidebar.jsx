import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";   // Adjust path if needed

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signout } = useAuth();   // ← this is the key

  const menu = [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Users", to: "/admin/users" },
    { label: "Shop Managers", to: "/admin/vendors" },
    { label: "Event Managers", to: "/admin/event-managers" },
    { label: "Events", to: "/admin/events" },
    { label: "Products", to: "/admin/products" },
    { label: "Orders", to: "/admin/orders" },
  ];

  const handleLogout = async () => {
    try {
      await signout();                    // Calls /auth/logout + clears state
      navigate("/admin/login", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
      // Optional: show toast/error message
      alert("Logout failed – please try again");
    }
  };

  return (
    <aside className="w-64 bg-yellow-200 shadow-lg min-h-screen p-4 fixed">
      <h1 className="text-2xl font-bold mb-8 px-2">Happy Tails</h1>

      <nav className="space-y-1">
        {menu.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`block px-4 py-2 rounded-md ${
              pathname === item.to
                ? "bg-yellow-400 font-semibold"
                : "hover:bg-yellow-300"
            }`}
          >
            {item.label}
          </Link>
        ))}

        {/* Changed from <a> to button */}
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 rounded-md hover:bg-yellow-300 text-red-700 font-medium"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}