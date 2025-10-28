// pages/PartnerRegistration/components/BackButton.jsx
import React from 'react';

const BackButton = ({ onBack }) => (
  <div className="flex justify-start mb-6">
    <button 
      onClick={onBack}
      className="flex items-center text-[#1a1a1a] hover:text-[#1a1a1a]/80 transition-colors"
    >
      <span className="text-2xl mr-2">←</span>
      Back to Selection
    </button>
  </div>
);

export default BackButton;