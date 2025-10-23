import React from "react";
import "../home.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3>Happy Tails</h3>
          <ul>
            <li><a href="/pet_accessory">Online Pet Accessories</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Partner</h3>
          <ul>
            <li><a href="/store_signup">Pet Store Franchise</a></li>
            <li><a href="/event_manager_signup">Become an Event Manager</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Policy</h3>
          <ul>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/refund-policy">Refund Policy</a></li>
            <li><a href="/cancellation-policy">Cancellation Policy</a></li>
            <li><a href="/terms-and-conditions">Terms & Conditions</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
