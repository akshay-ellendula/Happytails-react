import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1d26] text-white py-16 mt-32">
      <div className="mx-8 md:mx-20 lg:mx-28">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-6">Happy Tails</h3>
            <ul className="space-y-3">
              <li>
                <a href="/pet_accessory" className="hover:underline transition-all">
                  Online Pet Accessories
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">Partner</h3>
            <ul className="space-y-3">
              <li>
                <a href="/store_signup" className="hover:underline transition-all">
                  Pet Store Franchise
                </a>
              </li>
              <li>
                <a href="/event_manager_signup" className="hover:underline transition-all">
                  Become an Event Manager
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6">Policy</h3>
            <ul className="space-y-3">
              <li><a href="/privacy-policy" className="hover:underline">Privacy Policy</a></li>
              <li><a href="/refund-policy" className="hover:underline">Refund Policy</a></li>
              <li><a href="/cancellation-policy" className="hover:underline">Cancellation Policy</a></li>
              <li><a href="/terms-and-conditions" className="hover:underline">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
