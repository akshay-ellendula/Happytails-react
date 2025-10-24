import React, { useState } from "react"; // Added useState for side nav
import { Search } from "lucide-react";
import styles from "../home.module.css";

const Navbar = ({ user }) => {
  // Add state for mobile side navigation
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  return (
    <div className={styles.navbar}>
      {/* Changed header tag to use styles.header */}
      <header className={styles.header}>
        <div className={styles.badge}>
          {/* Changed a tag to use styles.a */}
          <a href="/" className={`${styles.a} ${styles.badge}`}> 
            Happy Tails
          </a>
        </div>

        <div className={`${styles['search-bar']} items-center`}>
          <Search className="h-8 w-8 pt-3" /> {/* Assuming Lucide handles its own styling */}
          {/* Changed input tag to use styles.input */}
          <input
            type="text"
            placeholder="Search.."
            size="25"
            className={styles.input} 
          />
        </div>

        <div className={styles.menu}>
          {/* Changed a tags to use styles.a */}
          <a href="/pet_accessory" className={styles.a}>Pet Essentials</a>
          <a href="/Events" className={styles.a}>Events</a>
          {user ? <a href="/profile" className={styles.a}>Profile</a> : <a href="/login" className={styles.a}>Login/SignUp</a>}
        </div>

        {/* Updated menu icon to toggle state */}
        <div className={styles['menu-icon']} id="menuIcon" onClick={() => setIsSideNavOpen(true)}>
          <img
            src="/icons/hamburger-svgrepo-com.svg" // Make sure this path is correct relative to public folder
            alt="Menu"
            height="25px"
          />
        </div>

         {/* Side Navbar - Apply open class based on state */}
        <div className={`${styles['side-navbar']} ${isSideNavOpen ? styles.open : ''}`} id="sideNavbar">
           {/* Changed close button a tag to use styles.a */}
          <a href="#" className={`${styles.a} ${styles['close-btn']}`} onClick={(e) => { e.preventDefault(); setIsSideNavOpen(false); }}> 
            &times;
          </a>
          {/* Changed a tags to use styles.a */}
          <a href="/pet_accessory" className={styles.a}>Essentials</a>
          <a href="/Events" className={styles.a}>Events</a>
          {user ? <a href="/profile" className={styles.a}>Profile</a> : <a href="/login" className={styles.a}>Login/SignUp</a>}
        </div>
      </header> 
    </div>
  );
};

export default Navbar;