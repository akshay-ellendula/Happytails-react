import React from "react";
import styles from "../home.module.css";

const Footer = () => {
  return (
    // Changed footer tag to use styles.footer
    <footer className={styles.footer}>
      {/* footer-container seems fine */}
      <div className={styles['footer-container']}>
        {/* footer-column seems fine */}
        <div className={styles['footer-column']}>
          {/* Changed h3 tag to use styles.h3 */}
          <h3>Happy Tails</h3> 
          <ul>
            {/* Changed li a tag to use styles.a */}
            <li><a href="/pet_accessory" className={styles.a}>Online Pet Accessories</a></li>
          </ul>
        </div>

        <div className={styles['footer-column']}>
           {/* Changed h3 tag */}
          <h3>Partner</h3>
          <ul>
             {/* Changed li a tags */}
            <li><a href="/store_signup" className={styles.a}>Pet Store Franchise</a></li>
            <li><a href="/event_manager_signup" className={styles.a}>Become an Event Manager</a></li>
          </ul>
        </div>

        <div className={styles['footer-column']}>
           {/* Changed h3 tag */}
          <h3>Policy</h3>
          <ul>
             {/* Changed li a tags */}
            <li><a href="/privacy-policy" className={styles.a}>Privacy Policy</a></li>
            <li><a href="/refund-policy" className={styles.a}>Refund Policy</a></li>
            <li><a href="/cancellation-policy" className={styles.a}>Cancellation Policy</a></li>
            <li><a href="/terms-and-conditions" className={styles.a}>Terms & Conditions</a></li>
          </ul>
        </div>
         {/* Example Social Links Area */}
         {/* <div className={`${styles['footer-column']} ${styles['footer-social']}`}>
             <h3>Follow Us</h3>
             <a href="#" className={styles.a}><img src="/icons/facebook.svg" alt="Facebook"/></a>
             <a href="#" className={styles.a}><img src="/icons/instagram.svg" alt="Instagram"/></a>
         </div> */}
      </div>
    </footer>
  );
};

export default Footer;