// src/Admin/Components/Header.jsx

import React from "react";

export default function Header({ title }) {
  return (
    <header className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold">{title}</h2>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
          A
        </div>
        <span className="text-gray-700 font-medium">Admin</span>
      </div>
    </header>
  );
}
