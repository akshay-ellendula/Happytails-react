import React, { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  
  const links = [
    { name: "My Profile", href: "/profile" },
    { name: "My Orders", href: "/my_orders" },
    { name: "My Events", href: "/my_events" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-black rounded-3xl p-8 h-fit sticky top-8 border-2 border-[#f2c737]">
        <div className="flex flex-col gap-6">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className={`text-lg text-center py-4 rounded-3xl font-medium transition-all duration-300 border border-black ${
                i === 0
                  ? "bg-[#f2c737] text-black"
                  : "text-[#f2c737] hover:bg-[#f2c737] hover:text-black"
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
          className="bg-black text-[#f2c737] px-6 py-3 rounded-lg font-medium text-lg transition-transform hover:scale-105 border border-[#f2c737]"
        >
          More
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
          <div className="pt-20 flex flex-col gap-6 px-4">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className={`text-lg text-center py-4 rounded-3xl font-medium transition-all border border-black ${
                  i === 0
                    ? "bg-[#f2c737] text-black"
                    : "text-[#f2c737] hover:bg-[#f2c737] hover:text-black"
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