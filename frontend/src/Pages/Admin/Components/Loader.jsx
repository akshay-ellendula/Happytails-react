// src/Admin/Components/Loader.jsx

import React from "react";

export default function Loader() {
  return (
    <div className="flex justify-center py-10">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-amber-100" />
        <div className="absolute inset-0 animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    </div>
  );
}
