import React, { useState } from 'react';
// import { Search } from 'lucide-react'; // Search not used here
import styles from '../pet-accessory.module.css';

const AccessoryNavbar = ({ user, setIsCartOpen }) => {
    const [isSideNavOpen, setIsSideNavOpen] = useState(false);

    return (
        <div className={styles.navbar}>
             {/* Use header class */}
            <header className={styles.header}>
                 {/* Use a with badge class */}
                <a href="/" className={`${styles.a} ${styles.badge}`}>Happy Tails</a> 

                {/* Desktop Menu */}
                <div className={styles.menu}>
                     {/* Use a class for links */}
                    <a href="/Events" className={styles.a}>Events</a>
                    {/* Use a class for Cart link */}
                    <a href="#" className={styles.a} onClick={(e) => { e.preventDefault(); setIsCartOpen(true); }}>Cart</a>
                    {/* Use a class for conditional links */}
                    {user ? <a href="/profile" className={styles.a}>Profile</a> : <a href="/login" className={styles.a}>Login/SignUp</a>} 
                </div>

                {/* Mobile Menu Icon */}
                <div className={styles['menu-icon']} onClick={() => setIsSideNavOpen(true)}>
                    <img src="/icons/hamburger-svgrepo-com.svg" alt="Menu" height="25px" />
                </div>

                {/* Side Navbar */}
                <div className={`${styles['side-navbar']} ${isSideNavOpen ? styles.open : ''}`} id="sideNavbar">
                     {/* Use a for close button */}
                    <a href="#" className={`${styles.a} ${styles['close-btn']}`} onClick={(e) => {e.preventDefault(); setIsSideNavOpen(false)}}>&times;</a> 
                     {/* Use a for links */}
                    <a href="/Events" className={styles.a}>Events</a>
                    {/* Use a for Cart link */}
                    <a href="#" className={styles.a} onClick={(e) => { e.preventDefault(); setIsSideNavOpen(false); setIsCartOpen(true); }}>Cart</a>
                    {/* Use a for conditional links */}
                    {user ? <a href="/profile" className={styles.a}>Profile</a> : <a href="/login" className={styles.a}>Login/SignUp</a>} 
                </div>
            </header>
        </div>
    );
};

export default AccessoryNavbar;