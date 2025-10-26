// pages/PartnerRegistration/PartnerRegistration.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PartnerSelection from "./components/PartnerSelection";
import StorePartnerForm from "./components/StorePartnerForm";
import EventManagerForm from "./components/EventManagerForm";
import BackButton from "./components/BackButton";

const PartnerRegistration = () => {
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Go back to partner selection
  const goBackToSelection = () => {
    setSelectedPartner(null);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #effe8b 0%, #f8ffb3 100%)",
      }}
    >
      <Toaster position="top-center" />

      {/* Navbar */}
      <nav className="bg-[#effe8b] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a
              href="/"
              className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] hover:scale-105 transition-transform"
            >
              🐾 Happy Tails
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {!selectedPartner ? (
          <PartnerSelection onSelectPartner={setSelectedPartner} />
        ) : (
          <>
            <BackButton onBack={goBackToSelection} />
            <div className="bg-white rounded-3xl border-4 border-black overflow-hidden">
              {selectedPartner === "store" ? (
                <StorePartnerForm
                  loading={loading}
                  setLoading={setLoading}
                  navigate={navigate}
                />
              ) : (
                <EventManagerForm
                  loading={loading}
                  setLoading={setLoading}
                  navigate={navigate}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PartnerRegistration;
