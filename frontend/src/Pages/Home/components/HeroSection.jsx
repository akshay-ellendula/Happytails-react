import React from "react";
import { images } from "../../../assets/assets.js";
import styles from "../home.module.css";

const HeroSection = () => {
  return (
    // Changed section tag to use styles.image-card
    <section className={styles['image-card']}>
      {/* Content div seems fine, styles.content exists */}
      <div className={`${styles.content} ${styles.startAnimation}`}>
        <div className={styles['centered-text']}>
          {/* Changed h1 tag to use styles.h1 */}
          <h1 className={styles.h1}>For The Pet who has EveryThing...</h1>
          {/* Changed p tag to use styles.p */}
          <p className={styles.p}>Still Deserves More!</p>
           {/* If you add a button here, use className={styles.button} */}
           {/* <button className={styles.button}>Example</button> */}
        </div>
      </div>

       {/* main_images div seems fine */}
      <div className={styles.main_images}>
        <img src={images.img2} className={`${styles['random-image']} ${styles.image1}`} alt="Image 1" />
        <img src={images.img3} className={`${styles['random-image']} ${styles.image2}`} alt="Image 2" />
        <img src={images.img4} className={`${styles['random-image']} ${styles.image3}`} alt="Image 3" />
        <img src={images.img5} className={`${styles['random-image']} ${styles.image4}`} alt="Image 4" />
      </div>
    </section>
  );
};

export default HeroSection;