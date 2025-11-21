import React, { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  
  // UPDATED: Removed "Logout" from this array
  const links = [
    { name: "My Profile", href: "/profile" },
    { name: "My Orders", href: "/my_orders" },
    { name: "My Events", href: "/my_events" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-dark rounded-3xl p-8 h-fit sticky top-8">
        <div className="flex flex-col gap-6">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className={`text-primary text-lg text-center py-4 rounded-3xl font-medium transition-all duration-300 ${
                i === 0
                  ? "bg-primary text-dark"
                  : "hover:bg-primary hover:text-dark"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>
      </aside>

      {/* Mobile Button */}
      <div className="lg:hidden flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="bg-dark text-primary px-6 py-3 rounded-lg font-medium text-lg transition-transform hover:scale-105"
        >
          More
        </button>
      </div>

      {/* Mobile Sidebar */}
      {open && (
        <div className="fixed inset-y-0 right-0 w-64 bg-dark transform transition-transform duration-300 z-50 lg:hidden">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-6 text-primary text-4xl"
          >
            &times;
          </button>
          <div className="pt-20 flex flex-col gap-6 px-4">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className={`text-primary text-lg text-center py-4 rounded-3xl font-medium transition-all ${
                  i === 0
                    ? "bg-primary text-dark"
                    : "hover:bg-primary hover:text-dark"
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}