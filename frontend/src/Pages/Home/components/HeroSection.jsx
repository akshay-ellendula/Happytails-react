import React from "react";
import { images } from "../../../assets/assets.js";
import styles from "../home.module.css";

const HeroSection = () => {
  return (
    <section className={styles['image-card']}>
      <div className={`${styles.content} ${styles.startAnimation}`}>
        <div className={styles['centered-text']}>
          <h1>For The Pet who has EveryThing...</h1>
          <p>Still Deserves More!</p>
        </div>
      </div>

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