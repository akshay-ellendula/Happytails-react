import React, { useState } from "react";
import { useLocation } from "react-router-dom";

export default function Sidebar({ activePage }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: "My Profile",  href: "/profile",      key: "profile" },
    { name: "My Orders",   href: "/my_orders",    key: "orders" },
    { name: "My Events",   href: "/my_events",    key: "events" },
    { name: "My Wishlist", href: "/my_wishlist",  key: "wishlist" },
  ];

  const isActive = (href) =>
    activePage
      ? links.find((l) => l.href === href)?.key === activePage
      : location.pathname === href;

  const linkClass = (href) =>
    `text-lg text-center py-4 rounded-3xl font-medium transition-all duration-300 border border-black flex items-center justify-center gap-2 ${
      isActive(href)
        ? "bg-[#f2c737] text-black"
        : "text-[#f2c737] hover:bg-[#f2c737] hover:text-black"
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-black rounded-3xl p-8 h-fit sticky top-8 border-2 border-[#f2c737]">
        <div className="flex flex-col gap-4">
          {links.map((link) => (
            <a key={link.key} href={link.href} className={linkClass(link.href)}>
              {link.key === "wishlist" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isActive(link.href) ? "#e11d48" : "none"}
                  stroke={isActive(link.href) ? "#e11d48" : "currentColor"}
                  strokeWidth="2"
                  style={{ width: "1.1rem", height: "1.1rem", flexShrink: 0 }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
              {link.name}
            </a>
          ))}
        </div>
      </aside>

      {/* Mobile Button */}
      <div className="lg:hidden flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="bg-black text-[#f2c737] px-6 py-3 rounded-lg font-medium text-lg transition-transform hover:scale-105 border border-[#f2c737]"
        >
          Menu
        </button>
      </div>

      {/* Mobile Sidebar */}
      {open && (
        <div className="fixed inset-y-0 right-0 w-64 bg-black transform transition-transform duration-300 z-50 lg:hidden border-l-2 border-[#f2c737]">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-6 text-[#f2c737] text-4xl"
          >
            &times;
          </button>
          <div className="pt-20 flex flex-col gap-4 px-4">
            {links.map((link) => (
              <a key={link.key} href={link.href} className={linkClass(link.href)}>
                {link.key === "wishlist" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isActive(link.href) ? "#e11d48" : "none"}
                    stroke={isActive(link.href) ? "#e11d48" : "currentColor"}
                    strokeWidth="2"
                    style={{ width: "1.1rem", height: "1.1rem", flexShrink: 0 }}
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
