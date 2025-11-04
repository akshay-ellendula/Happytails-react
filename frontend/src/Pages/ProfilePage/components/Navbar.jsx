import React, { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="mx-4 md:mx-20 lg:mx-28 py-6">
        <div className="flex justify-between items-center px-4 md:px-12">
          <a
            href="/"
            className="text-dark text-3xl md:text-4xl font-bold transition-transform duration-300 hover:scale-110"
          >
            Happy Tails
          </a>

          <div className="hidden md:flex gap-8 lg:gap-12">
            {["Pet Accessory", "Events", "Profile"].map((item, i) => (
              <a
                key={i}
                href={`/${item.replace(" ", "_").toLowerCase()}`}
                className={`text-dark text-lg font-medium relative after:content-[''] after:absolute after:left-0 after:bottom-0 ${
                  item === "Profile" ? "after:w-full" : "after:w-0"
                } after:h-0.5 after:bg-dark after:transition-all after:duration-300 hover:after:w-full`}
              >
                {item}
              </a>
            ))}
          </div>

          <button onClick={() => setMenuOpen(true)} className="md:hidden p-2">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <div className="fixed inset-y-0 left-0 w-64 bg-dark z-50 md:hidden transition-transform duration-300">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-4 right-6 text-primary text-4xl"
          >
            &times;
          </button>
          <div className="pt-20 flex flex-col gap-4">
            {["Pet Essentials", "Events", "Profile"].map((item, i) => (
              <a
                key={i}
                href={`/${item.replace(" ", "_").toLowerCase()}`}
                className={`block text-primary text-lg px-6 py-4 rounded-lg mx-4 ${
                  item === "Profile"
                    ? "bg-primary text-dark"
                    : "hover:bg-primary hover:text-dark transition-colors"
                }`}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
