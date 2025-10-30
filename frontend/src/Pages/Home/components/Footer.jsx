// components/Footer.jsx
import React from 'react';
import { Link } from 'react-router';
import { Twitter, Instagram, Facebook, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-white border-t-2 border-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div>
            <h3 className="text-white font-bold text-lg sm:text-xl mb-3 sm:mb-4">🐾 HappyTails</h3>
            <p className="text-white text-xs sm:text-sm">
              Your ultimate destination for discovering amazing pet events and connecting with the pet-loving community.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-2 text-white text-xs sm:text-sm">
              <li><Link to="/about" className="hover:text-[#effe8b] transition">About Us</Link></li>
              <li><Link to="/events" className="hover:text-[#effe8b] transition">Pet Events</Link></li>
              <li><Link to="/adoption" className="hover:text-[#effe8b] transition">Adoption</Link></li>
              <li><Link to="/blog" className="hover:text-[#effe8b] transition">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
            <ul className="space-y-2 text-white text-xs sm:text-sm">
              <li><Link to="/terms-and-conditions" className="hover:text-[#effe8b] transition">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#effe8b] transition">Privacy Policy</Link></li>
              <li><Link to="/contact" className="hover:text-[#effe8b] transition">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-[#effe8b] transition">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">List Your Event</h4>
            <p className="text-white text-xs sm:text-sm mb-3 sm:mb-4">
              Organize a pet event? List it on HappyTails!
            </p>
            <button className="bg-white text-[#1a1a1a] font-bold px-4 sm:px-6 py-2 rounded-full hover:bg-[#effe8b] transition text-xs sm:text-sm border border-white">
              Get Started
            </button>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white text-xs sm:text-sm text-center sm:text-left">
            © 2025 HappyTails. All rights reserved.
          </p>
          <div className="flex space-x-4 sm:space-x-6">
            <a href="#" className="text-white hover:text-[#effe8b] transition">
              <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
            <a href="#" className="text-white hover:text-[#effe8b] transition">
              <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
            <a href="#" className="text-white hover:text-[#effe8b] transition">
              <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
            <a href="#" className="text-white hover:text-[#effe8b] transition">
              <Youtube className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;