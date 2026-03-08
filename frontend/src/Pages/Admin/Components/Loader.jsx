// src/Admin/Components/Loader.jsx

import React from "react";

export default function Loader() {
  return (
    <div className="flex justify-center py-10">
      <div className="animate-spin h-8 w-8 border-4 border-gray-400 border-t-transparent rounded-full" />
    </div>
  );
}
