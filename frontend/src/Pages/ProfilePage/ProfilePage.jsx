import React, { useState } from "react"; // UPDATED: Import useState
// UPDATED: Import Header and MobileMenu
import Header from "../../components/Header"; 
import MobileMenu from "../../components/MobileMenu";
import Sidebar from "./components/Sidebar";
import ProfileForm from "./components/ProfileForm";
import Footer from "../../components/Footer";

export default function ProfilePage() {
  // UPDATED: Add mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-primary font-outfit min-h-screen flex flex-col">
      {/* UPDATED: Use Header and MobileMenu */}
      <Header onMenuToggle={toggleMobileMenu} />
      {isMobileMenuOpen && (
        <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex flex-col lg:flex-row gap-8 mx-4 md:mx-8 lg:mx-20 mt-12 mb-20 grow">
        <Sidebar />
        <main className="flex-1 max-w-4xl bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-12">
            Your Profile
          </h1>
          <ProfileForm />
        </main>
      </div>

      <Footer />
    </div>
  );
}