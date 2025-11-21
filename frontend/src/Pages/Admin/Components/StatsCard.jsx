// src/Admin/Components/StatsCard.jsx

import React from "react";

export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4">
      <h3 className="text-sm text-gray-600">{title}</h3>
      <div className="text-3xl font-semibold mt-2">{value}</div>
    </div>
  );
}
