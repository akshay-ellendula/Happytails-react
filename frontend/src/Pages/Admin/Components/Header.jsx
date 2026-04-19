// src/Admin/Components/Header.jsx

import React from "react";

export default function Header({ title }) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-yellow-100 px-6 py-4 flex justify-between items-center shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
      <div>
        <h2 className="text-2xl font-bold admin-page-title">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{today}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center font-bold shadow-md">
          A
        </div>
        <div>
          <p className="text-gray-800 font-semibold leading-none">Admin</p>
          <p className="text-xs text-gray-500 mt-1">Control Center</p>
        </div>
      </div>
    </header>
  );
}
