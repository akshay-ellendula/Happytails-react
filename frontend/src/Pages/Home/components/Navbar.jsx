import React from "react";
import { Search } from "lucide-react";
import styles from "../home.module.css";

const Navbar = ({ user }) => {
  return (
    <div className={styles.navbar}>
      <header className={styles.header}>
        <div className={styles.badge}>
          <a href="/home" className={styles.badge}>
            Happy Tails
          </a>
        </div>

        <div className={`${styles['search-bar']} items-center`}>
          <Search className="h-8 w-8 pt-3" />
          <input
            type="text"
            placeholder="Search.."
            size="25"
            className={styles.input} // Replaced inline style with a class to manage font-size
          />
        </div>

        <div className={styles.menu}>
          <a href="/pet_accessory">Pet Essentials</a>
          <a href="/Events">Events</a>
          {user ? <a href="/profile">Profile</a> : <a href="/login">Login/SignUp</a>}
        </div>

        <div className={styles['menu-icon']} id="menuIcon">
          <img
            src="/icons/hamburger-svgrepo-com.svg"
            alt="Menu"
            height="25px"
          />
        </div>

        <div className={styles['side-navbar']} id="sideNavbar">
          <a href="#" className={styles['close-btn']} id="closeBtn"> 
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