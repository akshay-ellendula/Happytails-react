import React from "react";
import { Search } from "lucide-react";
import "../home.css";

const Navbar = ({ user }) => {
  return (
    <div className="navbar">
      <header>
        <div className="badge">
          <a href="/home" className="badge">
            Happy Tails
          </a>
        </div>

        <div className="search-bar items-center">
          <Search className="h-8 w-8 pt-3" />
          <input
            type="text"
            placeholder="Search.."
            size="25"
            style={{ fontSize: "20px" }}
          />
        </div>

        <div className="menu">
          <a href="/pet_accessory">Pet Essentials</a>
          <a href="/Events">Events</a>
          {user ? <a href="/profile">Profile</a> : <a href="/login">Login/SignUp</a>}
        </div>

        <div className="menu-icon" id="menuIcon">
          <img
            src="/icons/hamburger-svgrepo-com.svg"
            alt="Menu"
            height="25px"
          />
        </div>

        <div className="side-navbar" id="sideNavbar">
          <a href="#" className="close-btn" id="closeBtn">
            &times;
          </a>
          <a href="/pet_accessory">Essentials</a>
          <a href="/Events">Events</a>
          {user ? <a href="/profile">Profile</a> : <a href="/login">Login/SignUp</a>}
        </div>
      </header>
    </div>
  );
};

export default Navbar;
