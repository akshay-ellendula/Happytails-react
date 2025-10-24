import React from "react";
import { images } from "../../../assets/assets.js";
import styles from "../home.module.css";

const AboutUs = () => {
  return (
    // Changed section tag to use styles.about-us
    <section className={`${styles['about-us']} ${styles.autoshow}`}>
      {/* Assuming about-us-imag is correct or adjust if needed */}
      <div className={styles['about-us-imag']}> 
        <img src={images.img1} alt="About Us" />
      </div>

       {/* Content div seems fine */}
      <div className={styles.content}>
        {/* Changed h2 tag to use styles.h2 */}
        <h2 className={styles.h2}>About Us</h2>
        {/* Changed p tag to use styles.p */}
        <p className={styles.p}>
          Welcome to Happy Tails — Where Every Wag Matters!
          <br />
          At Happy Tails, we believe that pets aren't just animals — they're family. 
          That's why we've created a one-stop destination for pet lovers who want 
          nothing but the best for their furry companions.
          <br />
          From thrilling dog races and exciting pet events to a carefully curated 
          selection of pet essentials and stylish accessories, Happy Tails brings 
          together community, care, and convenience — all under one digital roof. 
          Our mission is to make pet parenting joyful and stress-free by connecting 
          you with experiences and products that keep tails wagging and hearts full.
        </p>
      </div>
    </section>
  );
};

export default AboutUs;