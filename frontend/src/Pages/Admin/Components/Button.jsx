// src/Admin/Components/Button.jsx

import React from "react";

export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${className}`}
    >
      {children}
    </button>
  );
}
