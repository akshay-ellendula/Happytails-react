import React from "react";
import { images } from "../../../assets/assets.js";
import "../home.css";

const HeroSection = () => {
  return (
    <section className="image-card">
      <div className="content startAnimation">
        <div className="centered-text">
          <h1>For The Pet who has EveryThing...</h1>
          <p>Still Deserves More!</p>
        </div>
      </div>

      <div className="main_images">
        <img src={images.img3} className="random-image image1" alt="Image 1" />
        <img src="/images/Cat1.jpg" className="random-image image2" alt="Image 2" />
        <img src="/images/pet dog playing with owner.jpg" className="random-image image3" alt="Image 3" />
        <img src="/images/orange-cat.jpg" className="random-image image4" alt="Image 4" />
      </div>
    </section>
  );
};

export default HeroSection;
