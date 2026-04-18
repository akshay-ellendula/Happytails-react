// components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Instagram, Facebook, Youtube, PawPrint, ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white py-16 font-outfit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-[#f2c737] rounded-lg flex items-center justify-center">
                <PawPrint className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">HappyTails</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              Your ultimate destination for discovering amazing pet events and
              connecting with the pet-loving community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-white/50 hover:text-[#f2c737] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-white/50 hover:text-[#f2c737] transition-colors">
                  Pet Events
                </Link>
              </li>
              <li>
                <Link to="/pet_accessory" className="text-white/50 hover:text-[#f2c737] transition-colors">
                  Pet Shop
                </Link>
              </li>
              <li>
                <Link to="/service-login" className="text-white/50 hover:text-[#f2c737] transition-colors">
                  Service Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/terms" className="text-white/50 hover:text-[#f2c737] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/50 hover:text-[#f2c737] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/50 hover:text-[#f2c737] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/50 hover:text-[#f2c737] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">
              List Your Event
            </h4>
            <p className="text-white/40 text-sm mb-5 leading-relaxed">
              Organize a pet event? List it on HappyTails and reach thousands of pet lovers.
            </p>
            <Link to="/partnerRegistrataion">
              <button className="bg-[#f2c737] text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-white transition-colors text-sm flex items-center gap-2">
                Get Started <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <p className="text-white/30 text-sm text-center sm:text-left">
              © 2025 HappyTails. All rights reserved.
            </p>
            <Link
              to="/admin/login"
              className="text-white/10 hover:text-white/30 text-xs transition-colors select-none"
              title="Admin Access"
            >
              Admin
            </Link>
          </div>
          <div className="flex space-x-5">
            <a href="#" className="text-white/30 hover:text-[#f2c737] transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/30 hover:text-[#f2c737] transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/30 hover:text-[#f2c737] transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/30 hover:text-[#f2c737] transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;