// src/Admin/Components/Modal.jsx

import React from "react";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 admin-modal-backdrop">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg admin-modal-panel">
        {children}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
}
