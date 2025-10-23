import React from "react";
import { images } from "../../../assets/assets.js";
import "../home.css";

const AboutUs = () => {
  return (
    <section className="about-us autoshow">
      <div className="about-us-imag">
        <img src={images.img1} alt="About Us" />
      </div>

      <div className="content">
        <h2>About Us</h2>
        <p>
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
