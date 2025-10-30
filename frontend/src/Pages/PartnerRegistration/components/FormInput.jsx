// pages/PartnerRegistration/components/FormInput.jsx
import React from 'react';

const FormInput = ({ name, label, type, value, error, onChange }) => (
  <div className="relative">
    <input
      type={type}
      name={name}
      placeholder={label}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/20"
    />
    {error && (
      <div className="text-red-500 text-sm mt-1">{error}</div>
    )}
  </div>
);

export default FormInput;