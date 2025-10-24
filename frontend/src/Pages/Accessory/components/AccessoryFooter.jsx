import React from 'react';
import styles from '../pet-accessory.module.css';

const AccessoryFooter = () => {
    return (
         // Use footer class
        <footer className={styles.footer}> 
            <div className={styles['footer-container']}>
                <div className={styles['footer-column']}>
                     {/* Use h3 */}
                    <h3>Happy Tails</h3> 
                    <ul>
                         {/* Use a class */}
                        <li><a href="/pet_accessory" className={styles.a}>Online Pet Accessories</a></li> 
                    </ul>
                </div>
                <div className={styles['footer-column']}>
                     {/* Use h3 */}
                    <h3>Partner</h3> 
                    <ul>
                         {/* Use a class */}
                        <li><a href="/store_signup" className={styles.a}>Pet Store Franchise</a></li> 
                         {/* Use a class */}
                        <li><a href="/event_manager_signup" className={styles.a}>Become an Event manager</a></li> 
                    </ul>
                </div>
                <div className={styles['footer-column']}>
                     {/* Use h3 */}
                    <h3>Policy</h3> 
                    <ul>
                         {/* Use a class */}
                        <li><a href="/privacy-policy" className={styles.a}>Privacy Policy</a></li> 
                         {/* Use a class */}
                        <li><a href="/refund-policy" className={styles.a}>Refund Policy</a></li> 
                         {/* Use a class */}
                        <li><a href="/cancellation-policy" className={styles.a}>Cancellation Policy</a></li> 
                         {/* Use a class */}
                        <li><a href="/terms-and-conditions" className={styles.a}>Terms & Conditions</a></li> 
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default AccessoryFooter;